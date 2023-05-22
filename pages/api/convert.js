// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import axios from "axios";

export const config = {
  api: {
    responseLimit: '8mb',
  },
}

export default async function handler(req, res) {

  try {
    const image_url = req.body.url

    async function convertImageUrlToBase64(url) {
        try {
          // Fetch the image from the URL
          const response = await axios.get(url, { responseType: 'arraybuffer' });
      
          // Convert the image to a base64 string
          const base64Image = Buffer.from(response.data, 'binary').toString('base64');

          return base64Image;
        } catch (error) {
          console.error('Error converting image URL to base64:', error);
          return null;
        }
      }

    const base64 = await convertImageUrlToBase64(image_url)

    res.send( 'data:image/png;base64, ' + base64 )
  }
  catch (error) {
    console.error(error)
  }
      
}
  