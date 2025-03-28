import { Body, CurrentUser, JsonController, Params, Post } from 'routing-controllers';
import { getFirestore, Timestamp, FieldValue, Filter } from 'firebase-admin/firestore';
import { ChatParam, ChatReadParam } from '../validators/GenericRequests';
import { CreateChatMessage,CreateAvailabilityChat, CreateProposalChat, RespondProposalChat, MessageResponse, AvailabilityResponse, ChatResponse, ProposalResponse, ChatReadResponse } from '../../types';

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
      "listingID":chatBody.listindId,
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
   
  }
}

@JsonController('chat/')
export class ChatController {
    

  @Post('message/:id')
  //chose the return to be any since the chat response will vary a lot 
  async postChat(@Params() params: ChatParam,@Body() chatBody: CreateChatMessage): Promise<MessageResponse>{
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
    updateFirestore(chatId,doc.exists,chatBody,message,chatsRef,chatBody.text);
    return message;
    
  }

  @Post('availability/:id')
  async postAvailability(@Params() params: ChatParam,@Body() chatBody: CreateAvailabilityChat): Promise<AvailabilityResponse>{
    const chatId = params.id;
    const doc = await chatsRef.doc(chatId).get();
    const now = new Date();
    const message = {
      "type": "availability",
      "senderID": chatBody.senderId,
      "timestamp": now,
      "availabilities":chatBody.availabilities,
    }
    updateFirestore(chatId,doc.exists,chatBody,message,chatsRef,"");

    return message;
  }

  @Post('proposal/initial/:id')
  async sendProposal(@Params() params: ChatParam,@Body() chatBody: CreateProposalChat): Promise<ProposalResponse>{
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
    updateFirestore(chatId,doc.exists,chatBody,message,chatsRef,"");
    return message;
  }


  @Post('proposal/:id')
  async respondProposal(@Params() params: ChatParam,@Body() chatBody: RespondProposalChat): Promise<ProposalResponse>{
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
    updateFirestore(chatId,doc.exists,chatBody,message,chatsRef,"");
    return message;
  }


  @Post(':chatId/message/:messageId')
  async markAsRead(@Params() params: ChatReadParam): Promise<ChatReadResponse>{
    const chatId = params.chatId;
    const doc = await chatsRef.doc(chatId).get();
   
    if (!doc.exists) {
      console.log('No such document!');
      return {"read":false}
    } else {
      const subDocRef = chatsRef.doc(chatId)     // Main collection document
        .collection('messages') // Subcollection
        .doc(params.messageId);     // Subcollection document ID

      await subDocRef.update({
        read: true
      });

      await chatsRef.doc(chatId).update({
        updatedAt: new Date(),
      })
    }
    return {"read":true}
  }
  
}

