import { fireEvent, screen, waitFor } from '@testing-library/react';
import { Routes, Route } from 'react-router-dom';

import AllPerks from '../src/pages/AllPerks.jsx';
import { renderWithRouter } from './utils/renderWithRouter.js';


  

describe('AllPerks page (Directory)', () => {
  test('lists public perks and responds to name filtering', async () => {
    // The seeded record gives us a deterministic expectation regardless of the
    // rest of the shared database contents.
    const seededPerk = global.__TEST_CONTEXT__.seededPerk;

    // Sanity-check: ensure the seeded perk is visible via the public API before
    // rendering the UI. This gives a clear diagnostic if seeding failed.
    const allRes = await global.__TEST_CONTEXT__.api.get('/perks/all');
    const titles = allRes.data.perks.map((p) => p.title);
    if (!titles.includes(seededPerk.title)) {
      // Dump the server response to help debugging test environment issues.
      // eslint-disable-next-line no-console
      console.error('Expected seeded perk missing from /perks/all:', titles);
    }
    expect(titles).toContain(seededPerk.title);

    // Render the exploration page so it performs its real HTTP fetch.
    renderWithRouter(
      <Routes>
        <Route path="/explore" element={<AllPerks />} />
      </Routes>,
      { initialEntries: ['/explore'] }
    );

    // Wait for the baseline card to appear which guarantees the asynchronous
    // fetch finished. Allow a longer timeout because these are integration
    // tests that hit a live database.
    await screen.findByText(seededPerk.title, {}, { timeout: 10000 });

    // Interact with the name filter input using the real value that
    // corresponds to the seeded record.
    const nameFilter = screen.getByPlaceholderText('Enter perk name...');
    fireEvent.change(nameFilter, { target: { value: seededPerk.title } });

    await screen.findByText(seededPerk.title, {}, { timeout: 10000 });

    // The summary text should continue to reflect the number of matching perks.
    expect(screen.getByText(/showing/i)).toHaveTextContent('Showing');
  });

  /*
  TODO: Test merchant filtering
  - use the seeded record
  - perform a real HTTP fetch.
  - wait for the fetch to finish
  - choose the record's merchant from the dropdown
  - verify the record is displayed
  - verify the summary text reflects the number of matching perks
  */

  test('lists public perks and responds to merchant filtering', async () => {
    const seededPerk = global.__TEST_CONTEXT__.seededPerk;

    // Sanity-check the seeded perk is present at the API level first.
    const allRes = await global.__TEST_CONTEXT__.api.get('/perks/all');
    const titles = allRes.data.perks.map((p) => p.title);
    if (!titles.includes(seededPerk.title)) {
      // eslint-disable-next-line no-console
      console.error('Expected seeded perk missing from /perks/all:', titles);
    }
    expect(titles).toContain(seededPerk.title);

    renderWithRouter(
      <Routes>
        <Route path="/explore" element={<AllPerks />} />
      </Routes>,
      { initialEntries: ['/explore'] }
    );

    // Wait for initial fetch to complete and seeded card to be visible
    await screen.findByText(seededPerk.title, {}, { timeout: 10000 });

    // Open/select the merchant from the dropdown
    const merchantSelect = screen.getByRole('combobox');
    // Select the seeded merchant
    fireEvent.change(merchantSelect, { target: { value: seededPerk.merchant } });

    await waitFor(() => {
      expect(screen.getByText(seededPerk.title)).toBeInTheDocument();
    });

    // Summary text should reflect results
    expect(screen.getByText(/showing/i)).toHaveTextContent('Showing');
  });
});
