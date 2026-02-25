import axios, { type AxiosInstance } from 'axios';
import { config } from '../config/index.js';
import type { HubSpotCompany } from '../types/index.js';

const hubspotApi: AxiosInstance = axios.create({
  baseURL: 'https://api.hubapi.com',
  headers: {
    Authorization: `Bearer ${config.hubspot.accessToken}`,
    'Content-Type': 'application/json',
  },
});

export async function searchCompanies(query: string): Promise<HubSpotCompany[]> {
  const response = await hubspotApi.post('/crm/v3/objects/companies/search', {
    filterGroups: [
      {
        filters: [
          {
            propertyName: 'name',
            operator: 'CONTAINS_TOKEN',
            value: query,
          },
        ],
      },
    ],
    properties: ['name', 'domain'],
    limit: 10,
  });

  return response.data.results.map((r: { id: string; properties: { name: string; domain: string } }) => ({
    id: r.id,
    name: r.properties.name || '',
    domain: r.properties.domain || '',
  }));
}

export async function getCompaniesByContactEmail(email: string): Promise<HubSpotCompany[]> {
  // Find the contact by email
  const contactResponse = await hubspotApi.post('/crm/v3/objects/contacts/search', {
    filterGroups: [
      {
        filters: [
          {
            propertyName: 'email',
            operator: 'EQ',
            value: email,
          },
        ],
      },
    ],
    limit: 1,
  });

  if (!contactResponse.data.results?.length) return [];

  const contactId = contactResponse.data.results[0].id;

  // Get associated companies
  const assocResponse = await hubspotApi.get(
    `/crm/v3/objects/contacts/${contactId}/associations/companies`
  );

  if (!assocResponse.data.results?.length) return [];

  // Fetch company details
  const companyIds: string[] = assocResponse.data.results.map(
    (a: { id: string }) => a.id
  );

  const companies: HubSpotCompany[] = [];
  for (const companyId of companyIds) {
    const companyResponse = await hubspotApi.get(
      `/crm/v3/objects/companies/${companyId}`,
      { params: { properties: 'name,domain' } }
    );
    companies.push({
      id: companyResponse.data.id,
      name: companyResponse.data.properties.name || '',
      domain: companyResponse.data.properties.domain || '',
    });
  }

  return companies;
}

function markdownToHtml(markdown: string): string {
  return markdown
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
    .replace(/\n\n/g, '<br><br>')
    .replace(/\n/g, '<br>');
}

export async function createNote(
  companyId: string,
  noteBody: string,
  meetingDate: string
): Promise<string> {
  const htmlBody = markdownToHtml(noteBody);
  const timestamp = new Date(meetingDate).getTime();

  const response = await hubspotApi.post('/crm/v3/objects/notes', {
    properties: {
      hs_note_body: htmlBody,
      hs_timestamp: timestamp.toString(),
    },
    associations: [
      {
        to: { id: companyId },
        types: [
          {
            associationCategory: 'HUBSPOT_DEFINED',
            associationTypeId: 190,
          },
        ],
      },
    ],
  });

  return response.data.id;
}
