import { processChatMessage, detectBookIntent } from '../../../services/smartChatService';
import { publicDomainBooks, modernBooks, allCatalogBooks } from '../../../data/publicDomainBooks';

export { detectBookIntent, publicDomainBooks, modernBooks, allCatalogBooks };

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const message = body?.message || body?.prompt || '';
    const customApiKey = body?.apiKey || '';

    const responsePayload = await processChatMessage(message, customApiKey);
    return new Response(JSON.stringify(responsePayload), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        type: 'text',
        data: 'معذرت، درخواست پر کارروائی کے دوران عارضی دشواری پیش آئی ہے۔ براہ کرم دوبارہ کوشش فرمائیں۔'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}