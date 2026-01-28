/**
 * HubSpot Custom Coded Workflow Action
 *
 * Purpose: Associates a ticket with service records based on matching Product Type
 *
 * How it works:
 * 1. Gets the associated Company of the enrolled ticket
 * 2. Retrieves all Service records associated to that Company
 * 3. Compares the Product Type field on the ticket with each service's Product Type
 * 4. Creates associations between the ticket and services where Product Types match
 *
 * Requirements:
 * - This script should be used in a ticket-based workflow
 * - The ticket must have an associated Company
 * - Both tickets and services must have a "Product Type" property
 * - Requires a Private App with the following scopes:
 *   - crm.objects.contacts.read
 *   - crm.objects.companies.read
 *   - crm.objects.deals.read
 *   - crm.objects.custom.read
 *   - crm.objects.custom.write
 *   - tickets (read/write)
 *
 * Configuration:
 * - Update TICKET_PRODUCT_TYPE_PROPERTY with your ticket's product type property name
 * - Update SERVICE_PRODUCT_TYPE_PROPERTY with your service's product type property name
 * - Update SERVICE_OBJECT_TYPE with your custom object type ID or name for services
 * - Update TICKET_TO_SERVICE_ASSOCIATION_TYPE with your association type ID
 */

const hubspot = require('@hubspot/api-client');

// ============================================================================
// CONFIGURATION - Update these values to match your HubSpot portal setup
// ============================================================================

// Property names for Product Type on each object
const TICKET_PRODUCT_TYPE_PROPERTY = 'product_type'; // Change to your ticket's product type property
const SERVICE_PRODUCT_TYPE_PROPERTY = 'product_type'; // Change to your service's product type property

// Custom object type for Services (use the object type ID or fully qualified name)
// Example: '2-12345678' or 'p12345678_services'
const SERVICE_OBJECT_TYPE = 'services'; // Change to your service object type

// Association type ID for Ticket to Service association
// You can find this in HubSpot Settings > Data Management > Objects > Associations
// Or via the Associations API: GET /crm/v4/associations/{fromObjectType}/{toObjectType}/labels
const TICKET_TO_SERVICE_ASSOCIATION_TYPE = 'ticket_to_service'; // Change to your association type

// ============================================================================
// MAIN FUNCTION - HubSpot Custom Coded Action Entry Point
// ============================================================================

/**
 * Main entry point for HubSpot Custom Coded Workflow Action
 *
 * @param {Object} event - The workflow event object
 * @param {Object} event.inputFields - Input fields from the workflow
 * @param {string} event.inputFields.hs_object_id - The ticket ID (enrolled record)
 * @param {Object} event.secrets - Secrets configured in the workflow (e.g., PRIVATE_APP_TOKEN)
 * @returns {Object} Output fields for the workflow
 */
exports.main = async (event, callback) => {
  // Initialize HubSpot client with Private App token
  const hubspotClient = new hubspot.Client({
    accessToken: process.env.PRIVATE_APP_TOKEN || event.secrets.PRIVATE_APP_TOKEN
  });

  const ticketId = event.inputFields.hs_object_id;

  // Results tracking
  const results = {
    ticketId: ticketId,
    companyId: null,
    ticketProductType: null,
    servicesFound: 0,
    servicesMatched: 0,
    associationsCreated: 0,
    errors: []
  };

  try {
    // ========================================================================
    // STEP 1: Get the ticket and its Product Type
    // ========================================================================
    console.log(`Processing ticket ID: ${ticketId}`);

    const ticket = await hubspotClient.crm.tickets.basicApi.getById(
      ticketId,
      [TICKET_PRODUCT_TYPE_PROPERTY]
    );

    const ticketProductType = ticket.properties[TICKET_PRODUCT_TYPE_PROPERTY];
    results.ticketProductType = ticketProductType;

    if (!ticketProductType) {
      console.log('Ticket does not have a Product Type set. Exiting.');
      return callback({
        outputFields: {
          status: 'skipped',
          message: 'Ticket does not have a Product Type set',
          ...results
        }
      });
    }

    console.log(`Ticket Product Type: ${ticketProductType}`);

    // ========================================================================
    // STEP 2: Get the associated Company of the ticket
    // ========================================================================
    const ticketAssociations = await hubspotClient.crm.tickets.associationsApi.getAll(
      ticketId,
      'companies'
    );

    if (!ticketAssociations.results || ticketAssociations.results.length === 0) {
      console.log('No company associated with this ticket. Exiting.');
      return callback({
        outputFields: {
          status: 'skipped',
          message: 'No company associated with this ticket',
          ...results
        }
      });
    }

    // Use the first associated company (typically there's only one)
    const companyId = ticketAssociations.results[0].id;
    results.companyId = companyId;
    console.log(`Associated Company ID: ${companyId}`);

    // ========================================================================
    // STEP 3: Get all Service records associated to the Company
    // ========================================================================
    const companyServiceAssociations = await hubspotClient.crm.companies.associationsApi.getAll(
      companyId,
      SERVICE_OBJECT_TYPE
    );

    if (!companyServiceAssociations.results || companyServiceAssociations.results.length === 0) {
      console.log('No services associated with the company. Exiting.');
      return callback({
        outputFields: {
          status: 'skipped',
          message: 'No services associated with the company',
          ...results
        }
      });
    }

    const serviceIds = companyServiceAssociations.results.map(assoc => assoc.id);
    results.servicesFound = serviceIds.length;
    console.log(`Found ${serviceIds.length} services associated with the company`);

    // ========================================================================
    // STEP 4: Get Service details and filter by matching Product Type
    // ========================================================================
    // Batch read services to get their Product Type property
    const servicesResponse = await hubspotClient.crm.objects.batchApi.read(
      SERVICE_OBJECT_TYPE,
      {
        inputs: serviceIds.map(id => ({ id })),
        properties: [SERVICE_PRODUCT_TYPE_PROPERTY]
      }
    );

    // Filter services that match the ticket's Product Type
    const matchingServices = servicesResponse.results.filter(service => {
      const serviceProductType = service.properties[SERVICE_PRODUCT_TYPE_PROPERTY];
      // Case-insensitive comparison, trimming whitespace
      return serviceProductType &&
             serviceProductType.trim().toLowerCase() === ticketProductType.trim().toLowerCase();
    });

    results.servicesMatched = matchingServices.length;
    console.log(`Found ${matchingServices.length} services with matching Product Type`);

    if (matchingServices.length === 0) {
      return callback({
        outputFields: {
          status: 'completed',
          message: 'No services found with matching Product Type',
          ...results
        }
      });
    }

    // ========================================================================
    // STEP 5: Create associations between the ticket and matching services
    // ========================================================================
    // Check existing associations to avoid duplicates
    let existingServiceAssociations = [];
    try {
      const existingAssocs = await hubspotClient.crm.tickets.associationsApi.getAll(
        ticketId,
        SERVICE_OBJECT_TYPE
      );
      existingServiceAssociations = existingAssocs.results?.map(a => a.id) || [];
    } catch (e) {
      // No existing associations or object type not found - continue
      console.log('No existing ticket-service associations found');
    }

    // Create associations for matching services (skip if already associated)
    for (const service of matchingServices) {
      if (existingServiceAssociations.includes(service.id)) {
        console.log(`Service ${service.id} is already associated with the ticket. Skipping.`);
        continue;
      }

      try {
        await hubspotClient.crm.objects.associationsApi.create(
          'tickets',
          ticketId,
          SERVICE_OBJECT_TYPE,
          service.id,
          [{
            associationCategory: 'USER_DEFINED',
            associationTypeId: TICKET_TO_SERVICE_ASSOCIATION_TYPE
          }]
        );

        results.associationsCreated++;
        console.log(`Created association: Ticket ${ticketId} -> Service ${service.id}`);
      } catch (assocError) {
        // If the association type is a label string, try with HUBSPOT_DEFINED category
        try {
          await hubspotClient.apiRequest({
            method: 'PUT',
            path: `/crm/v4/objects/tickets/${ticketId}/associations/${SERVICE_OBJECT_TYPE}/${service.id}`,
            body: [{
              associationCategory: 'HUBSPOT_DEFINED',
              associationTypeId: getDefaultAssociationTypeId('tickets', SERVICE_OBJECT_TYPE)
            }]
          });

          results.associationsCreated++;
          console.log(`Created association (default type): Ticket ${ticketId} -> Service ${service.id}`);
        } catch (retryError) {
          const errorMsg = `Failed to associate ticket with service ${service.id}: ${retryError.message}`;
          console.error(errorMsg);
          results.errors.push(errorMsg);
        }
      }
    }

    // ========================================================================
    // STEP 6: Return results
    // ========================================================================
    const status = results.associationsCreated > 0 ? 'success' : 'completed';
    const message = results.associationsCreated > 0
      ? `Created ${results.associationsCreated} ticket-service association(s)`
      : 'No new associations created';

    console.log(`Completed: ${message}`);

    return callback({
      outputFields: {
        status: status,
        message: message,
        associationsCreated: results.associationsCreated,
        servicesMatched: results.servicesMatched,
        servicesFound: results.servicesFound,
        ticketProductType: results.ticketProductType,
        companyId: results.companyId,
        errors: results.errors.join('; ') || 'None'
      }
    });

  } catch (error) {
    console.error('Error in ticket-service association workflow:', error);

    return callback({
      outputFields: {
        status: 'error',
        message: error.message,
        ...results,
        errors: error.message
      }
    });
  }
};

/**
 * Helper function to get default association type ID
 * These are standard HubSpot association type IDs for common object combinations
 *
 * @param {string} fromObject - Source object type
 * @param {string} toObject - Target object type
 * @returns {number} Default association type ID
 */
function getDefaultAssociationTypeId(fromObject, toObject) {
  // For custom objects, the association type ID needs to be looked up
  // This is a placeholder - you should replace with your actual association type ID
  // You can find it via: GET /crm/v4/associations/tickets/{serviceObjectType}/labels
  return 1; // Default unlabeled association
}
