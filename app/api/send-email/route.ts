import { NextResponse } from 'next/server';
import sgMail from '@sendgrid/mail';
import { db } from '../../../firebase';
import { getDoc, doc } from 'firebase/firestore';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export async function POST(request: Request) {
  try {
    const { userId, subject, text, html } = await request.json();

    if (!userId || !subject || !text || !html) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const email = userSnap.data().email;

    await sgMail.send({
      to: email,
      from: 'scunewsroom@gmail.com',
      subject,
      text,
      html,
    });

    return NextResponse.json({ message: 'Email sent successfully' });
  } catch (error: any) {
    console.error('Email error:', error.response?.body || error.message || error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}

