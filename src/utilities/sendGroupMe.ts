

import axios from 'axios';

export interface GroupMeRecipient {
  id: string;
  name: string;
  contact: string | null;
}

export interface SendGroupMeParams {
  message: string;
  recipients: GroupMeRecipient[];
}
const accessToken = "VFPaf8IblVQ2Mu5Z445a2Q0pUH1azNu8eyI7dQTo"; //somehow we get this per RA user
const groupID = "111036119"; //RA user has to input this
export const sendGroupMe = async (params: SendGroupMeParams): Promise<boolean> => {
  try {
    const randomString = Math.random().toString(36).substring(2, 15); //random guid
    const messageData = {
      message: {
        source_guid: randomString,
        text: params.message
      }
    };

    console.log('Would send to recipients:', params.recipients);
    console.log('Message:', params.message);
    axios.post(`https://api.groupme.com/v3/groups/${groupID}/messages`, 
      messageData,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        params: {
          token: accessToken
        } 
      } 
    ); 
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return true;
  } catch (error) {
    console.error('Error sending GroupMe messages:', error);
    return false;
  }
};
