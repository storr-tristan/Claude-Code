# HubSpot Ticket-Service Association Script

A Node.js 20.x script for HubSpot Custom Coded Workflow Actions that automatically associates tickets with service records based on matching Product Type fields.

## Overview

This script automates the process of linking tickets to relevant services by:

1. **Finding the Company** - Identifies the company associated with the enrolled ticket
2. **Retrieving Services** - Gets all service records associated to that company
3. **Matching Product Types** - Compares the Product Type field on the ticket with each service
4. **Creating Associations** - Links the ticket to services where Product Types match

## Prerequisites

### HubSpot Requirements

- **HubSpot Plan**: Professional or Enterprise (required for custom coded actions)
- **Custom Object**: A "Services" custom object must exist in your portal
- **Properties**: Both tickets and services must have a "Product Type" property
- **Associations**: Company-to-Service and Ticket-to-Service associations must be defined

### Private App Setup

Create a Private App with the following scopes:

- `crm.objects.contacts.read`
- `crm.objects.companies.read`
- `crm.objects.deals.read`
- `crm.objects.custom.read`
- `crm.objects.custom.write`
- `tickets` (read/write)

## Configuration

Before deploying, update these constants in the script:

```javascript
// Property names for Product Type on each object
const TICKET_PRODUCT_TYPE_PROPERTY = 'product_type';
const SERVICE_PRODUCT_TYPE_PROPERTY = 'product_type';

// Custom object type for Services
const SERVICE_OBJECT_TYPE = 'services';

// Association type ID for Ticket to Service
const TICKET_TO_SERVICE_ASSOCIATION_TYPE = 'ticket_to_service';
```

### Finding Your Configuration Values

#### Service Object Type ID

1. Go to **Settings** → **Data Management** → **Objects**
2. Click on your Services object
3. The Object Type ID is in the URL: `objects/{objectTypeId}/schema`
4. Format: `2-XXXXXXX` (e.g., `2-12345678`)

#### Association Type ID

Use the HubSpot API to find your association type:

```bash
# Replace {serviceObjectTypeId} with your actual service object type ID
curl --request GET \
  --url 'https://api.hubapi.com/crm/v4/associations/tickets/{serviceObjectTypeId}/labels' \
  --header 'Authorization: Bearer YOUR_PRIVATE_APP_TOKEN'
```

#### Property Internal Names

1. Go to **Settings** → **Data Management** → **Properties**
2. Select the object type (Tickets or your custom object)
3. Find the "Product Type" property
4. Click to edit and note the "Internal name" field

## Deployment

### Step 1: Create the Workflow

1. Go to **Automation** → **Workflows**
2. Click **Create workflow** → **From scratch**
3. Select **Ticket-based** workflow
4. Choose your enrollment trigger (e.g., when a ticket is created or updated)

### Step 2: Add the Custom Coded Action

1. Click **+** to add an action
2. Search for "Custom code"
3. Select **Custom code** action
4. Choose **Node.js 20.x** as the runtime

### Step 3: Configure Secrets

1. In the custom code editor, click **Secrets**
2. Add a new secret:
   - **Name**: `PRIVATE_APP_TOKEN`
   - **Value**: Your Private App access token

### Step 4: Paste the Script

1. Copy the contents of `ticket-service-association.js`
2. Paste into the custom code editor
3. Update the configuration constants for your portal

### Step 5: Configure Output Fields (Optional)

Add these output properties to use in subsequent workflow actions:

| Property Name | Type |
|--------------|------|
| `status` | String |
| `message` | String |
| `associationsCreated` | Number |
| `servicesMatched` | Number |
| `servicesFound` | Number |
| `ticketProductType` | String |
| `companyId` | String |
| `errors` | String |

### Step 6: Test and Activate

1. Click **Test** to run with a sample ticket
2. Review the output in the test results
3. Once verified, turn the workflow **On**

## How It Works

```
┌─────────────────┐
│  Ticket Created │
│  or Updated     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Get Ticket's    │
│ Product Type    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Get Associated  │
│ Company         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Get Company's   │
│ Services        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Filter Services │
│ by Product Type │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Create Ticket   │
│ ↔ Service       │
│ Associations    │
└─────────────────┘
```

## Output States

| Status | Description |
|--------|-------------|
| `success` | One or more associations were created |
| `completed` | Script ran but no new associations needed |
| `skipped` | Missing required data (no company, no product type, etc.) |
| `error` | An error occurred during execution |

## Troubleshooting

### "No company associated with this ticket"

- Ensure the ticket is associated with a company before the workflow runs
- Add a workflow enrollment filter: `Associated company is known`

### "No services associated with the company"

- Verify that services are properly associated with companies
- Check that the `SERVICE_OBJECT_TYPE` matches your custom object

### "Association type not found"

- Verify your `TICKET_TO_SERVICE_ASSOCIATION_TYPE` value
- Check that the association between tickets and services exists in your portal

### "Insufficient permissions"

- Review your Private App scopes
- Ensure all required scopes are granted

## Example Scenario

**Setup:**
- Company "Acme Corp" has 3 services:
  - "Web Hosting" (Product Type: "Hosting")
  - "Email Support" (Product Type: "Support")
  - "Cloud Storage" (Product Type: "Hosting")

**Trigger:**
- A ticket is created for "Acme Corp" with Product Type: "Hosting"

**Result:**
- The script associates the ticket with:
  - "Web Hosting" ✓ (Product Type matches)
  - "Cloud Storage" ✓ (Product Type matches)
- "Email Support" is skipped (Product Type doesn't match)

## Customization

### Multiple Product Type Matching

To match multiple product types, modify the filter logic:

```javascript
const matchingServices = servicesResponse.results.filter(service => {
  const serviceProductType = service.properties[SERVICE_PRODUCT_TYPE_PROPERTY];
  // Match multiple product types (comma-separated)
  const ticketProductTypes = ticketProductType.split(',').map(t => t.trim().toLowerCase());
  return serviceProductType &&
         ticketProductTypes.includes(serviceProductType.trim().toLowerCase());
});
```

### Partial Matching

For partial/contains matching instead of exact:

```javascript
const matchingServices = servicesResponse.results.filter(service => {
  const serviceProductType = service.properties[SERVICE_PRODUCT_TYPE_PROPERTY];
  return serviceProductType &&
         serviceProductType.toLowerCase().includes(ticketProductType.toLowerCase());
});
```

## API Reference

This script uses the following HubSpot API endpoints:

- [Get Ticket](https://developers.hubspot.com/docs/api/crm/tickets) - `GET /crm/v3/objects/tickets/{ticketId}`
- [Get Associations](https://developers.hubspot.com/docs/api/crm/associations) - `GET /crm/v4/objects/{objectType}/{objectId}/associations/{toObjectType}`
- [Batch Read Objects](https://developers.hubspot.com/docs/api/crm/objects) - `POST /crm/v3/objects/{objectType}/batch/read`
- [Create Association](https://developers.hubspot.com/docs/api/crm/associations) - `PUT /crm/v4/objects/{objectType}/{objectId}/associations/{toObjectType}/{toObjectId}`

## License

MIT License - See project root for details.
