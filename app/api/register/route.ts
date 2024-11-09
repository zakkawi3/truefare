import bcrypt from "bcrypt";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { email, name, password, cardNumber } = await request.json();

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Make the request to the external API
        console.log(cardNumber);
        const response = await fetch('https://octopus-app-agn55.ondigitalocean.app/users/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email,
                name,
                cardNumber,           // Use 'cardNumber' to match the API request
                password: hashedPassword  // Send hashed password to the API
            }),
        });

        // Check if the response is successful
        if (!response.ok) {
            throw new Error('Failed to create user');
        }

        const user = await response.json();

        // Return the response from the API
        return NextResponse.json(user);
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: 'User registration failed' }, { status: 500 });
    }
}
