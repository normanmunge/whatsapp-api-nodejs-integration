# NODE.JS Integration with WhatsAPP Business API

## Prerequisites:

- Need to have a developer Meta Account. Sign up using [develeopers.facebook.com]
- Need to have node and npm installed on your local computer. This app is run using node v16

## TOOLS USED:

1. Postman - Used to fork out the Whatsapp API Cloud API. [https://web.postman.co/workspace/My-Workspace~fb6e0718-74fb-4368-868a-f5ed1b24a8e1/request/315327-1aa2a3f8-2f2f-4e80-baaa-7a7b7f3c3f7a]
2. Ngrok - Cross platform tunnel to expose our local development server to the internet

### Ngrok Installation

Need to install this to your local computer:

1. Download the package from the Ngrok Website[https://ngrok.com/]
2. Unzip it. For Mac users, in your terminal use the code below to move it to your Applications folder:
   `sudo cp ngrok /usr/bin/local`
3. Afterwards, login into the ngrok site and access your unique authtoken to authenticate and activate your ngrok agent:
   `ngrok config add-authtoken (unique authtoken)`
4. To use it, on your terminal:
   http: `ngrok http [PORT]`
   https: `ngrok http https://localhost:[PORT]`
   inspector: `http://127.0.0.1:4040`

### Other Resources

1. Whatsapp Cloud API [https://developers.facebook.com/apps/853568265946314/whatsapp-business/wa-dev-console/?business_id=240206303911472]
2. Sample Project [https://developers.facebook.com/blog/post/2022/10/31/sending-messages-with-whatsapp-in-your-nodejs-application/]
