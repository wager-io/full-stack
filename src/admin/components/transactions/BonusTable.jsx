import React from 'react';
import { CardGiftcard } from '@mui/icons-material';

/**
 * Bonuses — deliberately empty, and honest about why.
 *
 * This screen used to list invented bonus rows. There is no bonus system
 * behind it: no table, no RPC, no claim flow anywhere in the schema. Nothing
 * was being hidden by a filter or a missing permission — the feature does not
 * exist.
 *
 * Replacing fiction with an empty table would have been an improvement but
 * still a lie by omission: an operator would read "no bonuses yet" and
 * conclude none had been claimed, rather than that none *can* be. So this says
 * what is actually true.
 *
 * When bonuses are built, this becomes a normal table like DepositsTable —
 * a query, a search box, and the same card styling.
 */
export default function BonusTable() {
  return (
    <div className="py-16 flex flex-col items-center text-center">
      <CardGiftcard style={{ fontSize: '56px', color: 'var(--accent-purple)', opacity: 0.5 }} />

      <h3 className="mt-4 text-lg font-semibold" style={{ color: 'var(--text-light)' }}>
        Bonuses are not implemented yet
      </h3>

      <p className="mt-2 text-sm max-w-md" style={{ color: 'var(--text-dark)' }}>
        There is no bonus or rakeback system in the database — no table to read
        and no claim flow to record. This screen previously showed sample data,
        which made it look as though bonuses were running.
      </p>

      <div className="mt-6 px-5 py-4 rounded-xl text-left max-w-md"
        style={{ background: 'linear-gradient(145deg, #1a1d2e, #15182a)', border: '1px solid var(--border-color)' }}>
        <div className="text-xs font-semibold mb-2" style={{ color: 'var(--text-light)' }}>
          What building it needs first
        </div>
        <ul className="text-xs space-y-1" style={{ color: 'var(--text-dark)' }}>
          <li>• A rate per VIP tier — what percentage, of what</li>
          <li>• What it accrues on: every wager, or house edge only</li>
          <li>• How often it can be claimed, and whether it expires</li>
        </ul>
        <div className="text-xs mt-3" style={{ color: 'var(--text-dark)' }}>
          Those are policy decisions, not code ones: each is money leaving the
          house, so they have to be chosen rather than assumed.
        </div>
      </div>
    </div>
  );
}
