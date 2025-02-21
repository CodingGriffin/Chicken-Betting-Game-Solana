import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // Define the path to the JSON file
        const filePath = path.join(process.cwd(), 'data', 'data.json');

        // Read the file contents
        const fileContents = fs.readFileSync(filePath, 'utf8');

        // Parse the JSON data
        const data = JSON.parse(fileContents);

        return NextResponse.json(data);
    } catch (error) {
        console.error("Error reading JSON file:", error);
        return NextResponse.json(
            { message: "Error reading file", error },
            { status: 500 }
        );
    }
}
