import {API_BASE_URL} from "../../../config";

export async function create2D(element) {

    let url = `package/uml?id=${element.id}`;
    const res = await fetch(`/api/${url}`); // Replace with your API URL
    if (!res.ok) {
        throw new Error(`API Error: ${res.statusText}`);
    }
    const data = await res.json();

    // Update the store with fetched data
    return data;
}