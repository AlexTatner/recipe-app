import { NextRequest, NextResponse } from 'next/server';

const TABSCANNER_API_KEY = process.env.TABSCANNER_API_KEY;
const PROCESS_ENDPOINT = 'https://api.tabscanner.com/api/2/process';
const RESULT_ENDPOINT_BASE = 'https://api.tabscanner.com/api/result/';

interface LineItem {
  descClean: string;
}

interface TabscannerResult {
  status: string;
  result: {
    lineItems: LineItem[];
  };
}

async function pollForResult(token: string): Promise<TabscannerResult> {
  let attempts = 0;
  const maxAttempts = 20;
  const initialDelay = 4000; // 4 seconds
  const pollInterval = 2000; // 2 seconds

  await new Promise(resolve => setTimeout(resolve, initialDelay));

  while (attempts < maxAttempts) {
    try {
      const response = await fetch(`${RESULT_ENDPOINT_BASE}${token}`, {
        headers: {
          'apikey': TABSCANNER_API_KEY!,
        },
      });

      if (response.status === 202) {
        // Still processing
        attempts++;
        await new Promise(resolve => setTimeout(resolve, pollInterval));
        continue;
      }

      if (response.ok) {
        const result = await response.json();
        if (result.status === 'done') {
          return result;
        } else if (result.status === 'pending' || result.status === 'processing') {
            attempts++;
            await new Promise(resolve => setTimeout(resolve, pollInterval));
            continue;
        }
      }
    } catch (error) {
      console.error('Error polling for result:', error);
      throw new Error('Failed to poll for results from Tabscanner.');
    }
  }
  throw new Error('Tabscanner processing timed out.');
}


export async function POST(req: NextRequest) {
  if (!TABSCANNER_API_KEY) {
    return NextResponse.json({ error: 'Tabscanner API key not configured.' }, { status: 500 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
    }
    console.log('Received file:', file);
    if (!(file instanceof File)) {
      console.error('Received file is not a valid File object.', file);
      return NextResponse.json({ error: 'Invalid file type received.' }, { status: 400 });
    }
    console.log('File name:', file.name);

    const tabscannerFormData = new FormData();
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    tabscannerFormData.append('file', new Blob([fileBuffer], { type: file.type }), file.name);

    const processResponse = await fetch(PROCESS_ENDPOINT, {
      method: 'POST',
      headers: {
        'apikey': TABSCANNER_API_KEY,
      },
      body: tabscannerFormData,
    });

    if (!processResponse.ok) {
      const errorText = await processResponse.text();
      console.error('Tabscanner process error:', errorText);
      return NextResponse.json({ error: 'Failed to process image with Tabscanner.' }, { status: 500 });
    }

    const processResult = await processResponse.json();
    const token = processResult.token;

    if (!token) {
      return NextResponse.json({ error: 'Failed to get token from Tabscanner.' }, { status: 500 });
    }

    const result = await pollForResult(token);

    const ingredients = result.result.lineItems.map((item: LineItem) => item.descClean);

    return NextResponse.json({ ingredients });

  } catch (error) {
    console.error('Error in Tabscanner API route:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
