
// Assuming ActionItem is defined in use-chat-store.tsx or a shared types file
// For this example, let's import it if it's defined in use-chat-store.
// If ActionItem is in a dedicated types file, adjust the import path.
import type { ActionItem } from '@/hooks/use-chat-store';

// The ExternalOption interface might not be needed if the API directly returns ActionItem compatible objects.
// If the API structure is { data: ActionItem[] }, this service will handle extracting it.

export async function getExternalOptions(): Promise<ActionItem[]> {
  const baseUrl = 'https://n8n.srv810974.hstgr.cloud/';
  const endpoint = `${baseUrl}webhook/a98540f9-c936-434f-aacc-3f3d1a76a8c9/`;
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}), 
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error fetching external options (${response.status}): ${errorText}`);
      // Return a default error action item to indicate failure
      return [{ id: 'error-fetch', name: `Error loading options (${response.status})`, action: 'error_fetch_options' }];
    }

    const responseData = await response.json();

    // Assuming the actual array of actions is nested under a 'data' property in the JSON response
    if (responseData && responseData.data && Array.isArray(responseData.data)) {
      // Perform a simple validation/mapping if needed, or cast directly if confident in the structure
      return responseData.data.map((item: any) => ({
        id: item.id || `fallback-id-${Math.random().toString(36).substr(2, 9)}`, // Ensure ID exists
        name: item.name || 'Unnamed Action', // Ensure name exists
        action: item.action || 'default_action', // Ensure action exists
      })) as ActionItem[];
    } else {
      console.error("External options API did not return the expected data structure. Expected responseData.data to be an array. Received:", responseData);
      return [{ id: 'error-data-format', name: 'Invalid options format from server', action: 'error_data_format' }];
    }
  } catch (error) {
    console.error("Network or other error fetching external options:", error);
    // Return a default error action item for network or parsing errors
    return [{ id: 'error-network', name: 'Network error loading options', action: 'error_network_options' }];
  }
}
