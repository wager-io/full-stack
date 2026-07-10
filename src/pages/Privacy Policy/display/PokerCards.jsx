import React from 'react'

export default function PokerCards() {
  return (
    <div style={{ padding: '30px', fontFamily: 'Arial, sans-serif', lineHeight: '1.6', overflowY: "scroll", maxHeight: "90vh",  }}>
      <h1 style={{ color: 'white', fontSize: '28px', textAlign: 'center', fontWeight: 'bold' }}>Stake Poker Card Room Rules</h1><br />

      <section>
        <h2 style={{ fontSize: '25px', color: 'white', fontWeight: 'bold' }}>1. Card Room Rules</h2>
        <p><strong>a.</strong> The Stake Poker Card Room Rules ("Card Room Rules") must be read in conjunction with the Stake.com Terms and Conditions, which together constitute a binding agreement ("Agreement") between you and Medium Rare N.V (“Stake.com”).</p>
        <p><strong>b.</strong> The Terms & Conditions always take precedence over these Card Room Rules to the extent of any inconsistency...</p>
        
      </section><br />


      <section>
        <h2 style={{ fontSize: '25px', color: 'white', fontWeight: 'bold' }}>2. Playing Rules</h2>
        <p><strong>2.1. Minimum Amounts:</strong> In No Limit and Pot Limit Ring Games, the minimum amount required to be played is equal to the Big Blind...</p>
        <p><strong>2.2. Buying In:</strong> For the purpose of this section, “Table Stakes” means...</p>
      </section><br />


      <section>
        <h2 style={{ fontSize: '25px', color: 'white',fontWeight: 'bold' }}>3. Tournament Rules</h2>
        <p><strong>3.1. General Tournament Rules:</strong> All Tournament Games start promptly at the scheduled time...</p>
        <p><strong>3.2. Eliminations:</strong> The Tournament Game concludes when one player accumulates all chips...</p>
      </section><br />


      <section>
        <h2 style={{ fontSize: '25px', color: 'white', fontWeight: 'bold' }}>4. Bounty Tournament Rules</h2>
        <p><strong>4.1. General Rules:</strong> Bounty Tournaments operate like Tournament Games with the addition of bounties...</p>
      </section><br />


      <section>
        <h2 style={{ fontSize: '25px', color: 'white', fontWeight: 'bold' }}>5. All-in Tournament Rules</h2>
        <p><strong>5.1. General Rules:</strong> In All-in Tournaments, every participant is automatically ‘all-in’ for every hand...</p>
      </section><br />


      <section>
        <h2 style={{ fontSize: '25px', color: 'white',fontWeight: 'bold' }}>6. Sit ‘N’ Go Tournament Rules</h2>
        <p><strong>6.1 General Rules:</strong> SNG Tournaments start with a pre-set number of players...</p>
      </section><br />


      <section>
        <h2 style={{ fontSize: '25px', color: 'white', fontWeight: 'bold' }}>7. Rake</h2>
        <p><strong>No Limit and Pot Limit:</strong> Blinds, Rake %, and Player Cap details as per provided table...</p>
      </section><br />

      <section>
        <h2 style={{ fontSize: '25px', color: 'white', fontWeight: 'bold' }}>8. Dealing Procedures and Round of Play</h2>
        <p><strong>8.1 Game Commencement:</strong> Each player receives one face-up card... The dealer button rotates clockwise...</p>
        <p><strong>8.2 Initial Deal:</strong> Players receive hole cards. Wagering starts with the player to the left of the big blind...</p>
        <p><strong>8.3 Community Cards:</strong> The flop, turn, and river are dealt, followed by respective wagering rounds...</p>
        <p><strong>8.4 Showdown:</strong> Remaining players compare hands to determine the winner...</p>
        <p><strong>8.5 Determining Winners:</strong> Rules differ between Texas Hold’em and Omaha in forming best hands...</p>
      </section>
    </div>
  );
};

