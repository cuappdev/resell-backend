import { Body, CurrentUser, ForbiddenError, BadRequestError, JsonController, Params, Post } from 'routing-controllers';
import { getFirestore } from 'firebase-admin/firestore';
import { getManager, getConnection } from 'typeorm';
import { ChatParam, ChatReadParam } from '../validators/GenericRequests';
import { CreateChatMessage, CreateAvailabilityChat, CreateProposalChat, RespondProposalChat, MessageResponse, AvailabilityResponse, ProposalResponse, ChatReadResponse, CancelProposalResponse, FindTokensRequest } from '../../types';
import { UserModel } from '../../models/UserModel';
import { PostModel } from '../../models/PostModel';
import { TransactionModel } from '../../models/TransactionModel';
import { NotifService } from '../../services/NotifService';

const db = getFirestore();
const chatsRef = db.collection('chats_refactored');
export const updateFirestore = async (
  chatId: string,
  exists: boolean,
  chatBody: any,
  message: any,
  chatsRef: any,
  lastMessage: any,
) => {
  const now = new Date();
  if (!exists) {
    const data = {
      "listingID": chatBody.listingId ?? "",
      "buyerID": chatBody.buyerId ?? "",
      "sellerID": chatBody.sellerId ?? "",
      "userIDs": [chatBody.buyerId ?? "", chatBody.sellerId ?? ""],
      "lastMessage": lastMessage ?? "",
      "updatedAt": now,
    }
    await chatsRef.doc(chatId).set(data);
    // Add a document to the subcollection
    const subcollectionRef = chatsRef.doc(chatId).collection('messages');

    await subcollectionRef.add(message);

    console.log('Created new chat document!');
  } else {
    const subcollectionRef = chatsRef.doc(chatId).collection('messages');
    await subcollectionRef.add(message);
    if (lastMessage && lastMessage !== '') {
      await chatsRef.doc(chatId).update({
        lastMessage: lastMessage,
      })
    }

    await chatsRef.doc(chatId).update({
      updatedAt: new Date(),
    })

  }
}

export const checkUsers = async (chatId: string,
  userId: any
) => {
  const docRef = db.collection('chats_refactored').doc(chatId);
  const doc = await docRef.get();
  const userIDs = doc.data()?.userIDs || [];
  return userIDs.includes(userId);
}

@JsonController('chat/')
export class ChatController {


  @Post('message/:id')
  //chose the return to be any since the chat response will vary a lot 
  async postChat(@CurrentUser() user: UserModel, @Params() params: ChatParam, @Body() chatBody: CreateChatMessage): Promise<MessageResponse> {
    const chatId = params.id;
    const doc = await chatsRef.doc(chatId).get();
    const now = new Date();

    // Validate required fields
    if (!chatBody.senderId) {
      throw new BadRequestError("senderId is required");
    }

    const message = {
      "type": "message",
      "senderID": chatBody.senderId,
      "text": chatBody.text ?? "",  // Default to empty string if undefined
      "images": chatBody.images ?? [],  // Default to empty array if undefined
      "timestamp": now,
      "read": false
    }
    if (doc.exists) {
      const userCheck = await checkUsers(chatId, user.firebaseUid);
      if (!userCheck) {
        //TODO: factor this part out into a checkPermissions function that we can call in all the route
        throw new ForbiddenError("This user is not part of this chat");
      }

    }
    updateFirestore(chatId, doc.exists, chatBody, message, chatsRef, chatBody.text ?? "");
    return message;

  }

  @Post('availability/:id')
  async postAvailability(@CurrentUser() user: UserModel, @Params() params: ChatParam, @Body() chatBody: CreateAvailabilityChat): Promise<AvailabilityResponse> {
    const chatId = params.id;
    const doc = await chatsRef.doc(chatId).get();
    const now = new Date();

    // Validate required fields
    if (!chatBody.senderId) {
      throw new BadRequestError("senderId is required");
    }

    const availabilities = chatBody.availabilities ?? [];
    const processedAvailabilities = availabilities.map(availability => ({
      startDate: new Date(availability.startDate),
      endDate: new Date(availability.endDate)
    }));

    const message = {
      "type": "availability",
      "senderID": chatBody.senderId,
      "timestamp": now,
      "availabilities": processedAvailabilities,
    }

    const responseMessage: AvailabilityResponse = {
      type: "availability",
      senderID: chatBody.senderId,
      timestamp: now,
      availabilities: processedAvailabilities,
    }
    if (doc.exists) {
      const userCheck = await checkUsers(chatId, user.firebaseUid);
      if (!userCheck) {
        throw new ForbiddenError("This user is not part of this chat");
      }

    }
    updateFirestore(chatId, doc.exists, chatBody, message, chatsRef, "");

    return responseMessage;
  }

  @Post('proposal/initial/:id')
  async sendProposal(@CurrentUser() user: UserModel, @Params() params: ChatParam, @Body() chatBody: CreateProposalChat): Promise<ProposalResponse> {
    const chatId = params.id;
    const doc = await chatsRef.doc(chatId).get();
    const now = new Date();

    // Validate required fields
    if (!chatBody.senderId) {
      throw new BadRequestError("senderId is required");
    }
    if (!chatBody.startDate || !chatBody.endDate) {
      throw new BadRequestError("startDate and endDate are required");
    }

    const message = {
      "type": "proposal",
      "senderID": chatBody.senderId,
      "timestamp": now,
      "accepted": null,
      "startDate": chatBody.startDate,
      "endDate": chatBody.endDate,
    }
    if (doc.exists) {
      const userCheck = await checkUsers(chatId, user.firebaseUid);
      if (!userCheck) {
        throw new ForbiddenError("This user is not part of this chat");
      }

    }
    updateFirestore(chatId, doc.exists, chatBody, message, chatsRef, "");
    return message;
  }


  @Post('proposal/:id')
  async respondProposal(@CurrentUser() user: UserModel, @Params() params: ChatParam, @Body() chatBody: RespondProposalChat): Promise<ProposalResponse & { transactionId?: string }> {
    const chatId = params.id;
    const doc = await chatsRef.doc(chatId).get();
    const now = new Date();

    // Validate required fields
    if (!chatBody.senderId) {
      throw new BadRequestError("senderId is required");
    }
    if (chatBody.accepted === undefined) {
      throw new BadRequestError("accepted is required");
    }
    if (!chatBody.startDate || !chatBody.endDate) {
      throw new BadRequestError("startDate and endDate are required");
    }

    const message: any = {
      "type": "proposal",
      "senderID": chatBody.senderId,
      "timestamp": now,
      "accepted": chatBody.accepted,
      "startDate": chatBody.startDate,
      "endDate": chatBody.endDate,
    }

    if (doc.exists) {
      const userCheck = await checkUsers(chatId, user.firebaseUid);
      if (!userCheck) {
        throw new ForbiddenError("This user is not part of this chat");
      }
    }

    // If proposal is accepted, create a transaction
    let transactionId: string | undefined;
    console.log(`[PROPOSAL] chatBody.accepted = ${chatBody.accepted}, doc.exists = ${doc.exists}`);
    
    if (chatBody.accepted === true && doc.exists) {
      const chatData = doc.data();
      console.log(`[PROPOSAL] Chat data:`, JSON.stringify(chatData, null, 2));

      if (chatData) {
        const manager = getManager();

        // Get buyer, seller, and post from database
        console.log(`[PROPOSAL] Looking up: buyerID=${chatData.buyerID}, sellerID=${chatData.sellerID}, listingID=${chatData.listingID}`);
        const buyer = await manager.findOne(UserModel, { firebaseUid: chatData.buyerID });
        const seller = await manager.findOne(UserModel, { firebaseUid: chatData.sellerID });
        const post = await manager.findOne(PostModel, { id: chatData.listingID });
        console.log(`[PROPOSAL] Found: buyer=${!!buyer}, seller=${!!seller}, post=${!!post}`);

        if (buyer && seller && post) {
          // Use queryRunner with explicit transaction control
          const connection = getConnection();
          const queryRunner = connection.createQueryRunner();
          await queryRunner.connect();
          await queryRunner.startTransaction();
          
          const amount = post.altered_price ?? post.original_price;
          const transactionDate = new Date(chatBody.startDate);
          
          try {
            const result = await queryRunner.query(`
              INSERT INTO "Transaction" (location, amount, completed, post_id, buyer_id, seller_id, "transactionDate", "confirmationSent")
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
              RETURNING id
            `, ["", amount, false, post.id, buyer.firebaseUid, seller.firebaseUid, transactionDate, false]);
            
            await queryRunner.commitTransaction();
            transactionId = result[0].id;
            console.log(`[PROPOSAL] Transaction COMMITTED to DB: ${transactionId}`);
          } catch (saveError) {
            await queryRunner.rollbackTransaction();
            console.error(`[PROPOSAL] Failed to save transaction:`, saveError);
            throw saveError;
          } finally {
            await queryRunner.release();
          }

          // Add transaction ID to the message stored in Firestore
          message.transactionId = transactionId;

          console.log(`Transaction created: ${transactionId} for chat ${chatId}`);

          // Send notification to the buyer that their proposal was accepted
          // NOTE: This is done AFTER transaction is saved, so notification failures won't affect transaction
          try {
            const notifService = new NotifService(getManager());  // Use fresh manager to avoid transaction issues
            const imageUrl = post.images && post.images.length > 0 ? post.images[0] : null;

            // FCM requires all data values to be STRINGS
            const buyerNotifRequest: FindTokensRequest = {
              email: buyer.email,
              title: "Meeting Confirmed!",
              body: `${seller.username} accepted your meeting proposal for "${post.title}"`,
              data: {
                type: "messages",
                imageUrl: imageUrl || "",
                postId: post.id,
                postTitle: post.title,
                transactionId: transactionId,
                chatId: chatId,
                sellerId: seller.firebaseUid,
                sellerUsername: seller.username,
                sellerPhotoUrl: seller.photoUrl || "",
                meetingTime: String(chatBody.startDate)  // Convert to string for FCM
              } as unknown as JSON
            };
            await notifService.sendNotifs(buyerNotifRequest);
            console.log(`Notification sent to buyer ${buyer.email}`);
          } catch (notifError) {
            console.error(`Failed to send notification: ${notifError}`);
            // Don't fail the transaction creation if notification fails
          }
        } else {
          console.error(`Failed to create transaction: buyer=${!!buyer}, seller=${!!seller}, post=${!!post}`);
        }
      }
    }

    updateFirestore(chatId, doc.exists, chatBody, message, chatsRef, "");

    return {
      ...message,
      transactionId
    };
  }

  @Post('proposal/cancel/:id')
  async cancelProposal(@CurrentUser() user: UserModel, @Params() params: ChatParam, @Body() chatBody: CreateProposalChat): Promise<CancelProposalResponse> {
    const chatId = params.id;
    const doc = await chatsRef.doc(chatId).get();
    const now = new Date();

    // Validate required fields
    if (!chatBody.senderId) {
      throw new BadRequestError("senderId is required");
    }
    if (!chatBody.startDate || !chatBody.endDate) {
      throw new BadRequestError("startDate and endDate are required");
    }

    const message = {
      "type": "proposal",
      "senderID": chatBody.senderId,
      "timestamp": now,
      "cancellation": true,
      "startDate": chatBody.startDate,
      "endDate": chatBody.endDate,
    }
    if (doc.exists) {
      const userCheck = await checkUsers(chatId, user.firebaseUid);
      if (!userCheck) {
        throw new ForbiddenError("This user is not part of this chat");
      }

    }
    updateFirestore(chatId, doc.exists, chatBody, message, chatsRef, "");
    return message;
  }


  @Post(':chatId/message/:messageId')
  async markAsRead(@CurrentUser() user: UserModel, @Params() params: ChatReadParam): Promise<ChatReadResponse> {
    const chatId = params.chatId;
    const doc = await chatsRef.doc(chatId).get();

    if (!doc.exists) {
      console.log('No such document!');
      return { "read": false }
    } else {
      const userCheck = await checkUsers(chatId, user.firebaseUid);
      if (!userCheck) {
        throw new ForbiddenError("This user is not part of this chat");
      }
      const subDocRef = chatsRef.doc(chatId)     // Main collection document
        .collection('messages') // Subcollection
        .doc(params.messageId);     // Subcollection document ID

      await subDocRef.update({
        read: true
      });

    }
    return { "read": true }
  }



}
