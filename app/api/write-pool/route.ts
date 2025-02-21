import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { data } = body;

        if (!data) {
            return NextResponse.json(
                { message: "No data provided" },
                { status: 400 }
            );
        }

        // Define the path to the JSON file
        const filePath = path.join(process.cwd(), 'data', 'data.json');

        // Write data to the file
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');

        return NextResponse.json({ message: "File written successfully" });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { message: "Error writing file", error },
            { status: 500 }
        );
    }
}
