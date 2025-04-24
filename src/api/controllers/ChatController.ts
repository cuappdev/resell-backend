import { Body, CurrentUser, ForbiddenError, JsonController, Params, Post } from 'routing-controllers';
import { getFirestore } from 'firebase-admin/firestore';
import { ChatParam, ChatReadParam } from '../validators/GenericRequests';
import { CreateChatMessage,CreateAvailabilityChat, CreateProposalChat, RespondProposalChat, MessageResponse, AvailabilityResponse, ProposalResponse, ChatReadResponse } from '../../types';
import { UserModel } from '../../models/UserModel';

const db = getFirestore();
const chatsRef = db.collection('chats_refactored');
export const updateFirestore = async (
  chatId: string,
  exists:boolean,
  chatBody: any,
  message: any,
  chatsRef: any,
  lastMessage:any,
) => {
  const now = new Date();
  if (!exists) {
    const data = {
      "listingID":chatBody.listingId,
      "buyerID": chatBody.buyerId,
      "sellerID": chatBody.sellerId,
      "userIDs": [chatBody.buyerId, chatBody.sellerId],  
      "lastMessage": lastMessage,
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
    if (lastMessage!=''){
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
userId:any
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
  async postChat(@CurrentUser() user: UserModel,@Params() params: ChatParam,@Body() chatBody: CreateChatMessage): Promise<MessageResponse>{
    const chatId = params.id;
    const doc = await chatsRef.doc(chatId).get();
    const now = new Date();
    const message = {
      "type": "message",
      "senderID": chatBody.senderId,
      "text": chatBody.text,
      "images": chatBody.images,
      "timestamp": now,
      "read": false
    }
    if (doc.exists){
      const userCheck = await checkUsers(chatId,user.firebaseUid);
      if (!userCheck){
        //TODO: factor this part out into a checkPermissions function that we can call in all the route
        throw new ForbiddenError("This user is not part of this chat");
      }
      
    }
    updateFirestore(chatId,doc.exists,chatBody,message,chatsRef,chatBody.text);
    return message;
    
  }

  @Post('availability/:id')
  async postAvailability(@CurrentUser() user: UserModel,@Params() params: ChatParam,@Body() chatBody: CreateAvailabilityChat): Promise<AvailabilityResponse>{
    const chatId = params.id;
    const doc = await chatsRef.doc(chatId).get();
    const now = new Date();
    const message = {
      "type": "availability",
      "senderID": chatBody.senderId,
      "timestamp": now,
      "availabilities":chatBody.availabilities,
    }
    if (doc.exists){
      const userCheck = await checkUsers(chatId,user.firebaseUid);
      if (!userCheck){
        throw new ForbiddenError("This user is not part of this chat");
      }
      
    }
    updateFirestore(chatId,doc.exists,chatBody,message,chatsRef,"");

    return message;
  }

  @Post('proposal/initial/:id')
  async sendProposal(@CurrentUser() user: UserModel,@Params() params: ChatParam,@Body() chatBody: CreateProposalChat): Promise<ProposalResponse>{
    const chatId = params.id;
    const doc = await chatsRef.doc(chatId).get();
    const now = new Date();
    const message = {
      "type": "proposal",
      "senderID": chatBody.senderId,
      "timestamp": now,
      "accepted":null,
      "startDate":chatBody.startDate,
      "endDate":chatBody.endDate,
    }
    if (doc.exists){
      const userCheck = await checkUsers(chatId,user.firebaseUid);
      if (!userCheck){
        throw new ForbiddenError("This user is not part of this chat");
      }
      
    }
    updateFirestore(chatId,doc.exists,chatBody,message,chatsRef,"");
    return message;
  }


  @Post('proposal/:id')
  async respondProposal(@CurrentUser() user: UserModel,@Params() params: ChatParam,@Body() chatBody: RespondProposalChat): Promise<ProposalResponse>{
    const chatId = params.id;
    const doc = await chatsRef.doc(chatId).get();
    const now = new Date();
    const message = {
      "type": "proposal",
      "senderID": chatBody.senderId,
      "timestamp": now,
      "accepted":chatBody.accepted,
      "startDate":chatBody.startDate,
      "endDate":chatBody.endDate,
    }
    if (doc.exists){
      const userCheck = await checkUsers(chatId,user.firebaseUid);
      if (!userCheck){
        throw new ForbiddenError("This user is not part of this chat");
      }
      
    }
    updateFirestore(chatId,doc.exists,chatBody,message,chatsRef,"");
    return message;
  }


  @Post(':chatId/message/:messageId')
  async markAsRead(@CurrentUser() user: UserModel,@Params() params: ChatReadParam): Promise<ChatReadResponse>{
    const chatId = params.chatId;
    const doc = await chatsRef.doc(chatId).get();
   
    if (!doc.exists) {
      console.log('No such document!');
      return {"read":false}
    } else {
      const userCheck = await checkUsers(chatId,user.firebaseUid);
      if (!userCheck){
        throw new ForbiddenError("This user is not part of this chat");
      }
      const subDocRef = chatsRef.doc(chatId)     // Main collection document
        .collection('messages') // Subcollection
        .doc(params.messageId);     // Subcollection document ID

      await subDocRef.update({
        read: true
      });

    
    }
    return {"read":true}
  }
  
}

