import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { email, name, password, cardNumber } = await request.json();

        // Make the request to the external API without hashing the password
        console.log(cardNumber);
        const response = await fetch('https://octopus-app-agn55.ondigitalocean.app/users/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email,
                name,
                cardNumber,
                password  // Send plaintext password; the backend will hash it
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to create user');
        }

        const user = await response.json();

        return NextResponse.json(user);
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: 'User registration failed' }, { status: 500 });
    }
}