import React from 'react'

export default function PokerRefund() {
  
  const containerStyle = {
    padding: "20px",
    fontFamily: "Arial, sans-serif",
    maxWidth: "90%",
    margin: "20px auto",
    borderRadius: "10px",
    lineHeight: "1.6",
    // border: "1px solid #ccc",
    overflowY: "auto",
    maxHeight: "90vh"
  };

  const headingStyle = {
    textAlign: "center",
    fontSize: "26px",
    marginBottom: "20px",
    fontWeight: "bold",
    color: "white"
  };

  const sectionTitle = {
    fontSize: "20px",
    marginTop: "25px",
    fontWeight: "bold",
    color: "white"
  };

  const subItem = {
    marginLeft: "20px",
    marginBottom: "8px"
  };

  const listItem = {
    marginBottom: "10px"
  };

  const note = {
    fontStyle: "italic",
    color: "white",
    marginTop: "20px"
  };

  return (
    <div style={containerStyle}>
      <h1 style={headingStyle}>Stake Poker Tournament Cancellation and Refund Policy</h1>

      <h2 style={sectionTitle}>1. General</h2>
      <ul>
        <li style={listItem}>
          a. This Stake Poker tournament cancellation and refund policy (“Policy”) must be read
          alongside the Stake Poker Terms & Conditions and Card Room Rules.
        </li>
        <li style={listItem}>
          b. In case of any inconsistency between this Policy, the Terms and Conditions, the Card Room Rules, or any other applicable rules provided by Stake Poker, the resolution will follow this order of precedence:
          <ul>
            <li style={subItem}>i. Stake Poker Terms and Conditions</li>
            <li style={subItem}>ii. Card Room Rules</li>
            <li style={subItem}>iii. This Policy</li>
            <li style={subItem}>iv. Other applicable rules</li>
          </ul>
        </li>
        <li style={listItem}>
          c. Capitalized terms used but not defined in this Policy are as defined in the Card Room Rules.
        </li>
      </ul>

      <h2 style={sectionTitle}>2. Cancellation and Refund</h2>
      

      <h3 style={sectionTitle}>2.1. Where Cancellation Occurs before a Tournament Commences</h3>
      <ul>
        <li style={listItem}>a. Their buy-in amount;</li>
        <li style={listItem}>b. Their ‘Entry Fee,’ consisting of their tournament fee;</li>
        <li style={listItem}>c. In the case of Bounty Tournaments, their own Bounty.</li>
        <li style={listItem}>d. If a registered player uses a voucher or tournament ticket, the voucher or ticket will be credited to the account.</li>
        <li style={listItem}>e. If the tournament is a freeroll, no compensation will be provided.</li>
      </ul>

      <h3 style={sectionTitle}>2.2. Where Cancellation Occurs after a Tournament has Commenced</h3>
      <ul>
        <li style={listItem}>
          a. If cancelled before the Prize Stage:
          <ul>
            <li style={subItem}>i. Entry Fees, buy-ins, re-buys, and add-ons (excluding Bounties) will be refunded.</li>
            <li style={subItem}>ii. 50% of Prize Pool is split equally between remaining players.</li>
            <li style={subItem}>iii. 50% of Prize Pool is split proportionally based on chip count.</li>
          </ul>
        </li>
        <li style={listItem}>
          b. If cancelled and no players have been eliminated, refer to 2.1 refund terms.
        </li>
        <li style={listItem}>
          c. If cancelled after the Prize Stage:
          <ul>
            <li style={subItem}>i. Each player receives the minimum prize not yet awarded.</li>
            <li style={subItem}>ii. Remaining prize pool is split proportionally by chip count.</li>
          </ul>
        </li>
        <li style={listItem}>
          d. For guaranteed prize tournaments, the actual Prize Pool will be distributed, not the guaranteed amount.
        </li>
        <li style={listItem}>
          e. If a Bounty Tournament is cancelled:
          <ul>
            <li style={subItem}>i. Each remaining player receives their own Bounty back.</li>
            <li style={subItem}>ii. Each player keeps any Bounties they already earned.</li>
          </ul>
        </li>
        <li style={listItem}>
          f. Eliminated players are **not entitled to any refund** under any circumstance.
        </li>
      </ul>

      <p style={note}>
        This policy is subject to change based on Stake Poker’s discretion and should be reviewed periodically.
      </p>
    </div>
  );
};




  
