// import bcrypt from "bcrypt";

// import prisma from "@/app/libs/prismadb";
// import { NextResponse } from "next/server";

// export async function POST(
//     request: Request
// ){
//     const body = await request.json();
//     const {
//         email,
//         name,
//         password,
//         card
//     } = body;

//     const hashedPassword = await bcrypt.hash(password, 12);
//     // https://octopus-app-agn55.ondigitalocean.app/users/create

//     // const user = await prisma.user.create({
//     //     data: {
//     //         email,
//     //         name,
//     //         hashedPassword
//     //     }
//     // });

//     return NextResponse.json(user);
// }
// /app/api/register/route.ts

import bcrypt from "bcrypt";
import prisma from "@/app/libs/prismadb";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { email, name, password, card } = await request.json();

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await prisma.user.create({
            data: {
                email,
                name,
                card,
                hashedPassword
            }
        });

        return NextResponse.json(user);
    } catch (error) {
        return NextResponse.json({ error: 'User registration failed' }, { status: 500 });
    }
}
