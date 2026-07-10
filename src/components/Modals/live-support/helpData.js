// Articles database - each article has its own content
export const articles = {
  // Account Management Articles
  'Can I delete my account?': {
    title: 'Can I delete my account?',
    updated: 'Updated 2 weeks ago',
    content: {
      sections: [
        {
          type: 'text',
          content: 'Yes, you can delete your account at any time. Please note that this action is permanent and cannot be undone.'
        },
        {
          type: 'heading',
          content: 'Before deleting your account:'
        },
        {
          type: 'list',
          items: [
            'Withdraw all remaining funds from your account',
            'Cancel any active bonuses or promotions',
            'Download any important transaction history if needed'
          ]
        },
        {
          type: 'heading',
          content: 'Steps to delete your account:'
        },
        {
          type: 'list',
          items: [
            'Go to Account Settings',
            'Scroll down to "Account Management" section',
            'Click on "Close Account"',
            'Enter your password for verification',
            'Select a reason for account closure',
            'Confirm your decision by clicking "Delete Account"'
          ]
        },
        {
          type: 'warning',
          content: 'Once deleted, your account cannot be recovered. All data, transaction history, and VIP status will be permanently lost.'
        }
      ]
    }
  },
  
  'How to verify your email address?': {
    title: 'How to verify your email address?',
    updated: 'Updated 1 week ago',
    content: {
      sections: [
        {
          type: 'text',
          content: 'Email verification is required to secure your account and enable withdrawals and other important features.'
        },
        {
          type: 'heading',
          content: 'Automatic verification email:'
        },
        {
          type: 'list',
          items: [
            'Check your email inbox for a verification message from us',
            'The email should arrive within a few minutes of registration',
            'Click the "Verify Email" button in the email',
            'You will be redirected to confirm your email is verified'
          ]
        },
        {
          type: 'heading',
          content: 'If you don\'t receive the email:'
        },
        {
          type: 'list',
          items: [
            'Check your spam/junk folder',
            'Make sure you entered the correct email address',
            'Add our domain to your email whitelist',
            'Request a new verification email from your account settings'
          ]
        },
        {
          type: 'button',
          text: 'Resend Verification Email',
          action: 'resend-email'
        }
      ]
    }
  },
  
  'How to set up your Two-Factor Authentication (2FA) to your account?': {
    title: 'How to set up Two-Factor Authentication (2FA)',
    updated: 'Updated 3 days ago',
    content: {
      sections: [
        {
          type: 'text',
          content: 'Two-Factor Authentication (2FA) adds an extra layer of security to your account by requiring a second form of verification when logging in.'
        },
        {
          type: 'heading',
          content: 'Setting up 2FA with an Authenticator App:'
        },
        {
          type: 'list',
          items: [
            'Go to Security Settings in your account',
            'Click on "Enable Two-Factor Authentication"',
            'Download an authenticator app (Google Authenticator, Authy, etc.)',
            'Scan the QR code with your authenticator app',
            'Enter the 6-digit code from your app to confirm setup',
            'Save your backup codes in a secure location'
          ]
        },
        {
          type: 'heading',
          content: 'Setting up 2FA with SMS:'
        },
        {
          type: 'list',
          items: [
            'Go to Security Settings in your account',
            'Select "SMS Authentication"',
            'Enter and verify your phone number',
            'You will receive verification codes via text message'
          ]
        },
        {
          type: 'warning',
          content: 'Keep your backup codes safe! If you lose access to your 2FA device, these codes are the only way to regain access to your account.'
        }
      ]
    }
  },
  
  'Securing your funds: Using the Vault': {
    title: 'Securing your funds: Using the Vault',
    updated: 'Updated 5 days ago',
    content: {
      sections: [
        {
          type: 'text',
          content: 'The Vault is a secure storage feature that allows you to lock away funds for a specified period, protecting them from impulsive gambling.'
        },
        {
          type: 'heading',
          content: 'How to use the Vault:'
        },
        {
          type: 'list',
          items: [
            'Go to your Wallet or Account Settings',
            'Find the "Vault" or "Secure Storage" section',
            'Enter the amount you want to secure',
            'Choose a lock period (24 hours, 7 days, 30 days, etc.)',
            'Confirm the vault deposit'
          ]
        },
        {
          type: 'text',
          content: 'Once funds are in the vault, they cannot be withdrawn until the lock period expires. This helps promote responsible gambling habits.'
        }
      ]
    }
  },
  
  'How to reset your password?': {
    title: 'How to reset your password?',
    updated: 'Updated 1 week ago',
    content: {
      sections: [
        {
          type: 'text',
          content: 'If you\'ve forgotten your password, you can easily reset it using your registered email address.'
        },
        {
          type: 'heading',
          content: 'Password reset steps:'
        },
        {
          type: 'list',
          items: [
            'Go to the login page',
            'Click on "Forgot Password?"',
            'Enter your registered email address',
            'Check your email for a password reset link',
            'Click the link and create a new password',
            'Your new password must be at least 8 characters long'
          ]
        },
        {
          type: 'heading',
          content: 'Password requirements:'
        },
        {
          type: 'list',
          items: [
            'At least 8 characters long',
            'Include at least one uppercase letter',
            'Include at least one lowercase letter',
            'Include at least one number',
            'Include at least one special character (!@#$%^&*)'
          ]
        }
      ]
    }
  },
  
  // Identity Verification Articles
  'Proof of Identity: Acceptable Documentation': {
    title: 'Proof of Identity: Acceptable Documentation',
    updated: 'Updated over a month ago',
    content: {
      sections: [
        {
          type: 'text',
          content: 'Please note that our compliance team reserves the right to request any documentation at any given time.'
        },
        {
          type: 'heading',
          content: 'The following documents are acceptable as proof of identity:'
        },
        {
          type: 'list',
          items: [
            'International passport',
            'National ID card (both sides)',
            'Driving licence (both sides)'
          ]
        },
        {
          type: 'warning',
          content: 'Other types of document will not be accepted.'
        },
        {
          type: 'button',
          text: 'Update your Level 2 KYC here',
          action: 'kyc-update'
        },
        {
          type: 'heading',
          content: 'Your documentation must comply to the following criteria:'
        },
        {
          type: 'list',
          items: [
            'Document must be valid and not expired',
            'All information must be clearly visible',
            'Document must be in color',
            'No screenshots or photocopies'
          ]
        }
      ]
    }
  },
  
  // Stake Smart Articles
  'Self Exclusion': {
    title: 'Self Exclusion',
    updated: 'Updated 1 week ago',
    content: {
      sections: [
        {
          type: 'text',
          content: 'Self-exclusion is a responsible gambling tool that allows you to temporarily or permanently block your access to your account. This feature helps you maintain control over your gambling habits.'
        },
        {
          type: 'heading',
          content: 'How to set up Self Exclusion:'
        },
        {
          type: 'list',
          items: [
            'Go to Account Settings',
            'Navigate to "Responsible Gambling" section',
            'Click on "Self Exclusion"',
            'Choose the exclusion period (24 hours, 7 days, 1 month, 3 months, 6 months, or permanent)',
            'Confirm your decision by entering your password',
            'Your account will be immediately restricted'
          ]
        },
        {
          type: 'heading',
          content: 'What happens during self-exclusion:'
        },
        {
          type: 'list',
          items: [
            'You cannot access your account or place any bets',
            'All promotional materials will be stopped',
            'You cannot deposit funds during this period',
            'Existing funds remain safe in your account'
          ]
        },
        {
          type: 'warning',
          content: 'Self-exclusion cannot be reversed once activated. Please consider this decision carefully as it will immediately restrict all gambling activities on your account.'
        },
        {
          type: 'button',
          text: 'Set Up Self Exclusion',
          action: 'self-exclusion'
        }
      ]
    }
  },
  
  'Gambling Limits': {
    title: 'Gambling Limits',
    updated: 'Updated 3 days ago',
    content: {
      sections: [
        {
          type: 'text',
          content: 'Setting gambling limits helps you maintain control over your spending and time spent gambling. You can set various types of limits to suit your needs.'
        },
        {
          type: 'heading',
          content: 'Types of limits you can set:'
        },
        {
          type: 'list',
          items: [
            'Daily/Weekly/Monthly deposit limits',
            'Daily/Weekly/Monthly loss limits',
            'Daily/Weekly/Monthly wager limits',
            'Session time limits',
            'Single bet limits'
          ]
        },
        {
          type: 'heading',
          content: 'How to set gambling limits:'
        },
        {
          type: 'list',
          items: [
            'Go to Account Settings',
            'Select "Responsible Gambling"',
            'Choose "Gambling Limits"',
            'Set your desired limits for each category',
            'Confirm your settings',
            'Limits take effect immediately'
          ]
        },
        {
          type: 'text',
          content: 'Limit increases require a 24-hour cooling-off period before taking effect, while limit decreases are applied immediately.'
        },
        {
          type: 'button',
          text: 'Manage Your Limits',
          action: 'gambling-limits'
        }
      ]
    }
  },
  
  'Closing Your Account': {
    title: 'Closing Your Account',
    updated: 'Updated 5 days ago',
    content: {
      sections: [
        {
          type: 'text',
          content: 'If you decide to permanently close your account, we provide a straightforward process. This is different from self-exclusion as it permanently deletes your account.'
        },
        {
          type: 'heading',
          content: 'Before closing your account:'
        },
        {
          type: 'list',
          items: [
            'Withdraw all remaining funds',
            'Cancel any active bonuses',
            'Download transaction history if needed',
            'Consider self-exclusion as a temporary alternative'
          ]
        },
        {
          type: 'heading',
          content: 'Steps to close your account:'
        },
        {
          type: 'list',
          items: [
            'Contact our support team via live chat or email',
            'Request account closure',
            'Provide a reason for closure (optional)',
            'Confirm your identity for security purposes',
            'Your account will be permanently closed within 24 hours'
          ]
        },
        {
          type: 'warning',
          content: 'Account closure is permanent and cannot be reversed. All data, including transaction history and VIP status, will be permanently deleted.'
        },
        {
          type: 'button',
          text: 'Contact Support',
          action: 'contact-support'
        }
      ]
    }
  },
  
  'Casino Exclusion': {
    title: 'Casino Exclusion',
    updated: 'Updated 1 week ago',
    content: {
      sections: [
        {
          type: 'text',
          content: 'Casino exclusion allows you to block access to casino games while still maintaining access to other features like sports betting. This targeted approach helps you control specific gambling activities.'
        },
        {
          type: 'heading',
          content: 'What Casino Exclusion covers:'
        },
        {
          type: 'list',
          items: [
            'All slot games',
            'Table games (Blackjack, Roulette, Baccarat)',
            'Live dealer games',
            'Dice games',
            'Crash and other original games'
          ]
        },
        {
          type: 'heading',
          content: 'How to activate Casino Exclusion:'
        },
        {
          type: 'list',
          items: [
            'Go to Account Settings',
            'Navigate to "Responsible Gambling"',
            'Select "Casino Exclusion"',
            'Choose exclusion period (1 day to permanent)',
            'Confirm your decision',
            'Casino games will be immediately blocked'
          ]
        },
        {
          type: 'text',
          content: 'During casino exclusion, you can still access sports betting, account management, and withdrawal functions.'
        },
        {
          type: 'button',
          text: 'Set Casino Exclusion',
          action: 'casino-exclusion'
        }
      ]
    }
  },
  
  'Break In Play': {
    title: 'Break In Play',
    updated: 'Updated 2 days ago',
    content: {
      sections: [
        {
          type: 'text',
          content: 'Break In Play is a feature that allows you to take short breaks from gambling activities. Unlike self-exclusion, this is designed for brief pauses to help you maintain control.'
        },
        {
          type: 'heading',
          content: 'Break In Play options:'
        },
        {
          type: 'list',
          items: [
            '1 hour break',
            '4 hour break',
            '24 hour break',
            '48 hour break',
            '1 week break'
          ]
        },
        {
          type: 'heading',
          content: 'How to activate Break In Play:'
        },
        {
          type: 'list',
          items: [
            'Click on your profile menu',
            'Select "Take a Break"',
            'Choose your break duration',
            'Confirm the break period',
            'Your account will be temporarily restricted'
          ]
        },
        {
          type: 'text',
          content: 'During a break, you cannot place bets or access games, but you can still view your account balance and transaction history.'
        },
        {
          type: 'button',
          text: 'Take a Break',
          action: 'break-in-play'
        }
      ]
    }
  },
  
  'Help Organisations & Gambling Blocks': {
    title: 'Help Organisations & Gambling Blocks',
    updated: 'Updated 1 week ago',
    content: {
      sections: [
        {
          type: 'text',
          content: 'If you\'re struggling with gambling, there are many organizations that provide free, confidential support. We also support third-party blocking software to help you maintain control.'
        },
        {
          type: 'heading',
          content: 'International Support Organizations:'
        },
        {
          type: 'list',
          items: [
            'Gamblers Anonymous - gamblers-anonymous.org',
            'GamCare (UK) - gamcare.org.uk',
            'National Council on Problem Gambling (US) - ncpgambling.org',
            'Gambling Help Online (Australia) - gamblinghelponline.org.au',
            'Responsible Gambling Council (Canada) - responsiblegambling.org'
          ]
        },
        {
          type: 'heading',
          content: 'Gambling Blocking Software:'
        },
        {
          type: 'list',
          items: [
            'GamBlock - blocks access to gambling sites',
            'Betblocker - free gambling blocking tool',
            'Cold Turkey - comprehensive website blocker',
            'Net Nanny - parental control with gambling filters'
          ]
        },
        {
          type: 'text',
          content: 'These tools work independently of our platform and can provide additional protection by blocking access to gambling sites at the device or network level.'
        },
        {
          type: 'warning',
          content: 'If you\'re experiencing gambling-related problems, please seek help immediately. Remember, gambling should be fun and never interfere with your daily life or relationships.'
        }
      ]
    }
  },
  
  'Poker Exclusion': {
    title: 'Poker Exclusion',
    updated: 'Updated 4 days ago',
    content: {
      sections: [
        {
          type: 'text',
          content: 'Poker exclusion allows you to specifically block access to all poker games and tournaments while maintaining access to other casino games and sports betting.'
        },
        {
          type: 'heading',
          content: 'What Poker Exclusion includes:'
        },
        {
          type: 'list',
          items: [
            'All cash game tables',
            'Tournament play',
            'Sit & Go games',
            'Poker challenges and promotions',
            'Poker leaderboards and statistics'
          ]
        },
        {
          type: 'heading',
          content: 'How to set up Poker Exclusion:'
        },
        {
          type: 'list',
          items: [
            'Go to Account Settings',
            'Select "Responsible Gambling"',
            'Click on "Poker Exclusion"',
            'Choose the exclusion period',
            'Confirm your selection',
            'Poker access will be immediately blocked'
          ]
        },
        {
          type: 'text',
          content: 'During poker exclusion, any active tournament entries will be canceled and buy-ins refunded to your account balance.'
        },
        {
          type: 'button',
          text: 'Set Poker Exclusion',
          action: 'poker-exclusion'
        }
      ]
    }
  },
  
  'Deposit Limits': {
    title: 'Deposit Limits',
    updated: 'Updated 2 days ago',
    content: {
      sections: [
        {
          type: 'text',
          content: 'Deposit limits help you control how much money you can add to your account over specific time periods. This is one of the most effective tools for responsible gambling.'
        },
        {
          type: 'heading',
          content: 'Types of deposit limits:'
        },
        {
          type: 'list',
          items: [
            'Daily deposit limit - Maximum per 24-hour period',
            'Weekly deposit limit - Maximum per 7-day period',
            'Monthly deposit limit - Maximum per 30-day period'
          ]
        },
        {
          type: 'heading',
          content: 'Setting up deposit limits:'
        },
        {
          type: 'list',
          items: [
            'Navigate to Account Settings',
            'Go to "Responsible Gambling"',
            'Select "Deposit Limits"',
            'Set your desired limits for each time period',
            'Confirm your limits',
            'Limits take effect immediately'
          ]
        },
        {
          type: 'heading',
          content: 'Important notes about deposit limits:'
        },
        {
          type: 'list',
          items: [
            'Limit decreases are applied immediately',
            'Limit increases require a 24-hour waiting period',
            'Limits are calculated on a rolling basis',
            'Failed deposits still count toward your limit'
          ]
        },
        {
          type: 'button',
          text: 'Set Deposit Limits',
          action: 'deposit-limits'
        }
      ]
    }
  },
  
  // Local Currency Deposit Articles
  'Bank Transfer Deposit: Processing Time and Troubleshooting': {
    title: 'Bank Transfer Deposit: Processing Time and Troubleshooting',
    updated: 'Updated 3 days ago',
    content: {
      sections: [
        {
          type: 'text',
          content: 'Bank transfer deposits are a secure way to fund your account using your bank account. Processing times vary depending on your bank and location.'
        },
        {
          type: 'heading',
          content: 'Processing Times:'
        },
        {
          type: 'list',
          items: [
            'Instant transfers: Usually processed within minutes',
            'Standard bank transfers: 1-3 business days',
            'International transfers: 3-5 business days',
            'Weekend/holiday transfers may take longer'
          ]
        },
        {
          type: 'heading',
          content: 'How to make a bank transfer deposit:'
        },
        {
          type: 'list',
          items: [
            'Go to the Wallet section',
            'Click "Deposit"',
            'Select "Bank Transfer"',
            'Enter your deposit amount',
            'Follow the banking instructions provided',
            'Complete the transfer through your bank'
          ]
        },
        {
          type: 'heading',
          content: 'Troubleshooting common issues:'
        },
        {
          type: 'list',
          items: [
            'Check if you used the correct reference number',
            'Verify the recipient bank details are correct',
            'Ensure your bank allows gambling transactions',
            'Contact your bank if the transfer was declined',
            'Check for any daily/monthly transfer limits'
          ]
        },
        {
          type: 'warning',
          content: 'Always use the exact reference number provided to ensure your deposit is credited correctly.'
        },
        {
          type: 'button',
          text: 'Contact Support for Deposit Issues',
          action: 'contact-support'
        }
      ]
    }
  },
  
  'Local Currency: Can I Deposit with my Credit Card?': {
    title: 'Local Currency: Can I Deposit with my Credit Card?',
    updated: 'Updated 1 week ago',
    content: {
      sections: [
        {
          type: 'text',
          content: 'Credit card deposits are available in many regions and offer instant funding for your account. Availability depends on your location and card issuer policies.'
        },
        {
          type: 'heading',
          content: 'Supported Credit Cards:'
        },
        {
          type: 'list',
          items: [
            'Visa (most regions)',
            'Mastercard (most regions)',
            'American Express (limited regions)',
            'Local credit cards (region-specific)'
          ]
        },
        {
          type: 'heading',
          content: 'How to deposit with your credit card:'
        },
        {
          type: 'list',
          items: [
            'Navigate to Wallet > Deposit',
            'Select "Credit Card" as payment method',
            'Enter your card details securely',
            'Specify the deposit amount',
            'Complete the 3D Secure verification if prompted',
            'Funds are usually available instantly'
          ]
        },
        {
          type: 'heading',
          content: 'Important considerations:'
        },
        {
          type: 'list',
          items: [
            'Some banks block gambling transactions',
            'Daily/monthly limits may apply',
            'Additional verification may be required',
            'Processing fees may apply depending on your card'
          ]
        },
        {
          type: 'text',
          content: 'If your credit card deposit is declined, try using a different card or contact your bank to authorize gambling transactions.'
        },
        {
          type: 'button',
          text: 'Try Credit Card Deposit',
          action: 'deposit-credit-card'
        }
      ]
    }
  },
  
  '"Payments Temporarily Unavailable" Message. What does it mean?': {
    title: '"Payments Temporarily Unavailable" Message',
    updated: 'Updated 2 days ago',
    content: {
      sections: [
        {
          type: 'text',
          content: 'This message appears when our payment processing system is undergoing maintenance or experiencing technical difficulties. It\'s usually temporary and resolves quickly.'
        },
        {
          type: 'heading',
          content: 'Common reasons for this message:'
        },
        {
          type: 'list',
          items: [
            'Scheduled maintenance on payment systems',
            'Temporary technical issues with payment providers',
            'High traffic causing system delays',
            'Regional payment processor maintenance',
            'Security updates being applied'
          ]
        },
        {
          type: 'heading',
          content: 'What to do when you see this message:'
        },
        {
          type: 'list',
          items: [
            'Wait 15-30 minutes and try again',
            'Try a different payment method if available',
            'Check our social media for maintenance announcements',
            'Clear your browser cache and cookies',
            'Try using a different browser or device'
          ]
        },
        {
          type: 'heading',
          content: 'Alternative solutions:'
        },
        {
          type: 'list',
          items: [
            'Use cryptocurrency deposits if available',
            'Try mobile app instead of web browser',
            'Contact live support for alternative methods',
            'Check if other payment options are working'
          ]
        },
        {
          type: 'text',
          content: 'Most payment issues resolve within 1-2 hours. If the problem persists longer, please contact our support team.'
        },
        {
          type: 'button',
          text: 'Contact Live Support',
          action: 'contact-support'
        }
      ]
    }
  },
  
  'Canadian Dollars: How to Make a Deposit?': {
    title: 'Canadian Dollars: How to Make a Deposit?',
    updated: 'Updated 5 days ago',
    content: {
      sections: [
        {
          type: 'text',
          content: 'Canadian players can deposit funds in CAD using various payment methods. We support most major Canadian banks and payment providers.'
        },
        {
          type: 'heading',
          content: 'Available deposit methods for CAD:'
        },
        {
          type: 'list',
          items: [
            'Interac e-Transfer (most popular)',
            'Canadian credit cards (Visa, Mastercard)',
            'Bank wire transfers',
            'Digital wallets (Skrill, Neteller)',
            'Cryptocurrency (converted to CAD)'
          ]
        },
        {
          type: 'heading',
          content: 'Step-by-step deposit process:'
        },
        {
          type: 'list',
          items: [
            'Log into your account',
            'Go to Wallet section',
            'Click "Deposit"',
            'Select "CAD" as your currency',
            'Choose your preferred payment method',
            'Enter deposit amount (minimum $20 CAD)',
            'Follow the payment instructions',
            'Complete the transaction'
          ]
        },
        {
          type: 'heading',
          content: 'Interac e-Transfer instructions:'
        },
        {
          type: 'list',
          items: [
            'Use the email address provided',
            'Include the exact reference number',
            'Use the security question and answer given',
            'Transfers typically process within 30 minutes',
            'Check your email for confirmation'
          ]
        },
        {
          type: 'text',
          content: 'Deposits are typically processed instantly or within a few hours. Interac e-Transfer is the most reliable method for Canadian players.'
        },
        {
          type: 'button',
          text: 'Make CAD Deposit',
          action: 'deposit-cad'
        }
      ]
    }
  },
  
  'Indian Rupee: How to Make a Deposit?': {
    title: 'Indian Rupee: How to Make a Deposit?',
    updated: 'Updated 1 week ago',
    content: {
      sections: [
        {
          type: 'text',
          content: 'Indian players can deposit funds in INR using various local payment methods. We support popular Indian payment systems for convenient deposits.'
        },
        {
          type: 'heading',
          content: 'Available deposit methods for INR:'
        },
        {
          type: 'list',
          items: [
            'UPI (PhonePe, Google Pay, Paytm)',
            'NetBanking (all major Indian banks)',
            'Credit/Debit cards (Rupay, Visa, Mastercard)',
            'Digital wallets (Paytm, MobiKwik)',
            'Bank transfers (IMPS, NEFT, RTGS)'
          ]
        },
        {
          type: 'heading',
          content: 'How to deposit with UPI:'
        },
        {
          type: 'list',
          items: [
            'Go to Wallet > Deposit',
            'Select "UPI" as payment method',
            'Enter deposit amount (minimum ₹500)',
            'Scan the QR code with your UPI app',
            'Or use the provided UPI ID',
            'Complete payment in your UPI app',
            'Funds reflect within 5-10 minutes'
          ]
        },
        {
          type: 'heading',
          content: 'NetBanking deposit process:'
        },
        {
          type: 'list',
          items: [
            'Select "NetBanking" as deposit method',
            'Choose your bank from the list',
            'Enter deposit amount',
            'You\'ll be redirected to your bank\'s website',
            'Login with your banking credentials',
            'Authorize the payment',
            'Return to our site for confirmation'
          ]
        },
        {
          type: 'warning',
          content: 'Ensure your bank allows online gaming transactions. Some banks may block such payments for security reasons.'
        },
        {
          type: 'text',
          content: 'UPI deposits are usually the fastest, processing within 5-10 minutes. NetBanking and card deposits may take up to 30 minutes.'
        },
        {
          type: 'button',
          text: 'Make INR Deposit',
          action: 'deposit-inr'
        }
      ]
    }
  },
  
  // Local Currency Withdrawal Articles
  'Bank Transfer Withdrawal: Processing Time and Troubleshooting': {
    title: 'Bank Transfer Withdrawal: Processing Time and Troubleshooting',
    updated: 'Updated 2 days ago',
    content: {
      sections: [
        {
          type: 'text',
          content: 'Bank transfer withdrawals are a secure method to transfer your winnings directly to your bank account. Processing times depend on your bank and region.'
        },
        {
          type: 'heading',
          content: 'Processing Times:'
        },
        {
          type: 'list',
          items: [
            'Standard bank transfers: 1-3 business days',
            'International transfers: 3-7 business days',
            'Same-day transfers: Available for select banks',
            'Weekends and holidays may cause delays'
          ]
        },
        {
          type: 'heading',
          content: 'How to request a bank transfer withdrawal:'
        },
        {
          type: 'list',
          items: [
            'Go to Wallet section',
            'Click "Withdraw"',
            'Select "Bank Transfer"',
            'Enter withdrawal amount',
            'Provide your bank account details',
            'Verify your identity if required',
            'Submit the withdrawal request'
          ]
        },
        {
          type: 'heading',
          content: 'Required bank information:'
        },
        {
          type: 'list',
          items: [
            'Full name (must match account registration)',
            'Bank account number',
            'Bank routing/sort code',
            'SWIFT/BIC code (for international transfers)',
            'Bank name and address'
          ]
        },
        {
          type: 'heading',
          content: 'Common troubleshooting issues:'
        },
        {
          type: 'list',
          items: [
            'Verify all bank details are correct',
            'Ensure account name matches your registered name',
            'Check if your bank accepts international transfers',
            'Complete identity verification if pending',
            'Contact support if withdrawal is delayed beyond expected timeframe'
          ]
        },
        {
          type: 'warning',
          content: 'Withdrawals can only be processed to bank accounts in your registered name. Third-party transfers are not permitted for security reasons.'
        },
        {
          type: 'button',
          text: 'Contact Support for Withdrawal Issues',
          action: 'contact-support'
        }
      ]
    }
  },
  
  'Local Currency: Can I Withdraw to my Credit Card?': {
    title: 'Local Currency: Can I Withdraw to my Credit Card?',
    updated: 'Updated 1 week ago',
    content: {
      sections: [
        {
          type: 'text',
          content: 'Credit card withdrawals are available in select regions and depend on your card issuer\'s policies. This method allows you to withdraw funds back to the same card used for deposits.'
        },
        {
          type: 'heading',
          content: 'Credit card withdrawal availability:'
        },
        {
          type: 'list',
          items: [
            'Only available for cards used to make deposits',
            'Visa and Mastercard widely supported',
            'American Express support varies by region',
            'Some banks may block gambling-related credits'
          ]
        },
        {
          type: 'heading',
          content: 'How to withdraw to your credit card:'
        },
        {
          type: 'list',
          items: [
            'Navigate to Wallet > Withdraw',
            'Select "Credit Card" as withdrawal method',
            'Choose the card you used for deposits',
            'Enter withdrawal amount',
            'Confirm the withdrawal request',
            'Wait for processing confirmation'
          ]
        },
        {
          type: 'heading',
          content: 'Important limitations:'
        },
        {
          type: 'list',
          items: [
            'Can only withdraw up to the amount deposited via that card',
            'Excess winnings must be withdrawn via alternative methods',
            'Processing time: 3-5 business days',
            'May appear as a refund on your card statement'
          ]
        },
        {
          type: 'heading',
          content: 'Alternative withdrawal methods:'
        },
        {
          type: 'list',
          items: [
            'Bank transfer for larger amounts',
            'Digital wallets (Skrill, Neteller)',
            'Cryptocurrency withdrawals',
            'Check with support for region-specific options'
          ]
        },
        {
          type: 'text',
          content: 'If credit card withdrawal is not available in your region, bank transfer is typically the most reliable alternative method.'
        },
        {
          type: 'button',
          text: 'Try Credit Card Withdrawal',
          action: 'withdraw-credit-card'
        }
      ]
    }
  },
  
  'Withdrawal Processing Times and Fees': {
    title: 'Withdrawal Processing Times and Fees',
    updated: 'Updated 4 days ago',
    content: {
      sections: [
        {
          type: 'text',
          content: 'Understanding withdrawal processing times and fees helps you plan your cashouts effectively. Times and fees vary depending on the withdrawal method and your location.'
        },
        {
          type: 'heading',
          content: 'Processing Times by Method:'
        },
        {
          type: 'list',
          items: [
            'Cryptocurrency: 10 minutes - 2 hours',
            'Digital Wallets: 1-24 hours',
            'Credit Card: 3-5 business days',
            'Bank Transfer: 1-7 business days',
            'Check/Money Order: 7-21 business days'
          ]
        },
        {
          type: 'heading',
          content: 'Standard withdrawal fees:'
        },
        {
          type: 'list',
          items: [
            'Cryptocurrency: Network fees apply (varies)',
            'Digital Wallets: Usually free or minimal fees',
            'Credit Card: No fees from our side',
            'Bank Transfer: May include wire transfer fees',
            'Express/Priority: Additional fees may apply'
          ]
        },
        {
          type: 'heading',
          content: 'Factors affecting processing time:'
        },
        {
          type: 'list',
          items: [
            'Account verification status',
            'Withdrawal amount (larger amounts may require additional review)',
            'First-time withdrawal to new payment method',
            'Weekend and holiday processing delays',
            'Additional security checks for high-value withdrawals'
          ]
        },
        {
          type: 'heading',
          content: 'Tips for faster withdrawals:'
        },
        {
          type: 'list',
          items: [
            'Complete full account verification early',
            'Use the same method you used for deposits',
            'Withdraw during business hours on weekdays',
            'Choose cryptocurrency for fastest processing',
            'Avoid withdrawing during peak times'
          ]
        },
        {
          type: 'warning',
          content: 'First-time withdrawals and withdrawals to new payment methods may require additional verification and take longer to process.'
        },
        {
          type: 'button',
          text: 'Check Withdrawal Status',
          action: 'check-withdrawal-status'
        }
      ]
    }
  },
  
  'Why is my withdrawal taking so long?': {
    title: 'Why is my withdrawal taking so long?',
    updated: 'Updated 3 days ago',
    content: {
      sections: [
        {
          type: 'text',
          content: 'Withdrawal delays can be frustrating, but they usually occur for security and compliance reasons. Understanding common causes can help you avoid future delays.'
        },
        {
          type: 'heading',
          content: 'Common reasons for delays:'
        },
        {
          type: 'list',
          items: [
            'Incomplete account verification',
            'Additional security review for large amounts',
            'Anti-money laundering (AML) compliance checks',
            'Technical issues with payment providers',
            'Banking holidays or weekends',
            'Incorrect withdrawal details provided'
          ]
        },
        {
          type: 'heading',
          content: 'Verification requirements causing delays:'
        },
        {
          type: 'list',
          items: [
            'Identity verification (ID document)',
            'Address verification (utility bill)',
            'Source of funds documentation',
            'Payment method verification',
            'Enhanced due diligence for high-value accounts'
          ]
        },
        {
          type: 'heading',
          content: 'What you can do:'
        },
        {
          type: 'list',
          items: [
            'Check your email for verification requests',
            'Complete any pending verification tasks',
            'Verify withdrawal details are correct',
            'Contact live support for status updates',
            'Provide any additional documents requested',
            'Be patient during compliance reviews'
          ]
        },
        {
          type: 'heading',
          content: 'When to contact support:'
        },
        {
          type: 'list',
          items: [
            'Withdrawal pending longer than stated timeframe',
            'No response to submitted verification documents',
            'Error messages during withdrawal process',
            'Unexpected rejection of withdrawal request',
            'Need clarification on required documents'
          ]
        },
        {
          type: 'text',
          content: 'Most withdrawal delays are resolved within 24-72 hours once all verification requirements are met. Our security measures protect both you and the platform.'
        },
        {
          type: 'button',
          text: 'Contact Support About Delayed Withdrawal',
          action: 'contact-support'
        }
      ]
    }
  },
  
  'Indian Rupee: How to Withdraw Funds': {
    title: 'Indian Rupee: How to Withdraw Funds',
    updated: 'Updated 1 week ago',
    content: {
      sections: [
        {
          type: 'text',
          content: 'Indian players can withdraw funds in INR using various local withdrawal methods. We support popular Indian banking systems for convenient cashouts.'
        },
        {
          type: 'heading',
          content: 'Available withdrawal methods for INR:'
        },
        {
          type: 'list',
          items: [
            'Bank transfer (IMPS/NEFT/RTGS)',
            'UPI withdrawals (limited banks)',
            'Digital wallets (Paytm, PhonePe)',
            'Cryptocurrency (converted to INR)',
            'Credit/Debit card refunds'
          ]
        },
        {
          type: 'heading',
          content: 'Bank transfer withdrawal process:'
        },
        {
          type: 'list',
          items: [
            'Go to Wallet > Withdraw',
            'Select "Bank Transfer (INR)"',
            'Enter withdrawal amount (minimum ₹1000)',
            'Provide your Indian bank account details',
            'Enter IFSC code and account number',
            'Verify account holder name matches your profile',
            'Submit withdrawal request'
          ]
        },
        {
          type: 'heading',
          content: 'Required banking information:'
        },
        {
          type: 'list',
          items: [
            'Bank account number',
            'IFSC code',
            'Account holder name (exact match required)',
            'Bank name and branch',
            'Mobile number linked to bank account'
          ]
        },
        {
          type: 'heading',
          content: 'Processing times and limits:'
        },
        {
          type: 'list',
          items: [
            'IMPS: 15 minutes - 2 hours',
            'NEFT: 2-4 hours during banking hours',
            'RTGS: 30 minutes - 2 hours',
            'Daily withdrawal limit: ₹2,00,000',
            'Monthly withdrawal limit: ₹10,00,000'
          ]
        },
        {
          type: 'warning',
          content: 'Ensure your bank account is active and allows online gaming transactions. Some banks may block such transfers due to policy restrictions.'
        },
        {
          type: 'text',
          content: 'Bank transfer is the most reliable withdrawal method for Indian players, with IMPS being the fastest option for smaller amounts.'
        },
        {
          type: 'button',
          text: 'Withdraw INR',
          action: 'withdraw-inr'
        }
      ]
    }
  },
  
  'Canadian Dollars: Making a Withdrawal via Bank Transfer': {
    title: 'Canadian Dollars: Making a Withdrawal via Bank Transfer',
    updated: 'Updated 5 days ago',
    content: {
      sections: [
        {
          type: 'text',
          content: 'Canadian players can withdraw funds in CAD directly to their bank accounts. We support all major Canadian banks and credit unions for secure withdrawals.'
        },
        {
          type: 'heading',
          content: 'Supported Canadian banks:'
        },
        {
          type: 'list',
          items: [
            'Royal Bank of Canada (RBC)',
            'Toronto-Dominion Bank (TD)',
            'Bank of Nova Scotia (Scotiabank)',
            'Bank of Montreal (BMO)',
            'Canadian Imperial Bank of Commerce (CIBC)',
            'Most credit unions and regional banks'
          ]
        },
        {
          type: 'heading',
          content: 'How to withdraw CAD via bank transfer:'
        },
        {
          type: 'list',
          items: [
            'Navigate to Wallet > Withdraw',
            'Select "Bank Transfer (CAD)"',
            'Enter withdrawal amount (minimum $50 CAD)',
            'Provide your Canadian bank account details',
            'Enter institution number, transit number, and account number',
            'Verify account holder name matches registration',
            'Submit withdrawal request'
          ]
        },
        {
          type: 'heading',
          content: 'Required banking information:'
        },
        {
          type: 'list',
          items: [
            'Institution number (3 digits)',
            'Transit number (5 digits)',
            'Account number',
            'Account holder full name',
            'Bank name and branch address'
          ]
        },
        {
          type: 'heading',
          content: 'Processing and fees:'
        },
        {
          type: 'list',
          items: [
            'Processing time: 1-3 business days',
            'No fees for withdrawals over $100 CAD',
            'Small fee may apply for withdrawals under $100 CAD',
            'Faster processing available for verified accounts',
            'Interac e-Transfer available for smaller amounts'
          ]
        },
        {
          type: 'text',
          content: 'Bank transfers are the most secure and widely accepted withdrawal method for Canadian players. Ensure your bank account is in good standing to avoid delays.'
        },
        {
          type: 'button',
          text: 'Withdraw CAD',
          action: 'withdraw-cad'
        }
      ]
    }
  },
  
  'Is there a Wager Requirement for Local Currencies?': {
    title: 'Is there a Wager Requirement for Local Currencies?',
    updated: 'Updated 6 days ago',
    content: {
      sections: [
        {
          type: 'text',
          content: 'Wager requirements, also known as playthrough requirements, may apply to certain deposits and bonuses. Understanding these requirements helps you plan your withdrawals effectively.'
        },
        {
          type: 'heading',
          content: 'When wager requirements apply:'
        },
        {
          type: 'list',
          items: [
            'Bonus deposits (welcome bonuses, reload bonuses)',
            'Promotional deposits with bonus funds',
            'VIP rewards and cashback bonuses',
            'Free spins and free bet winnings',
            'Some deposit methods in certain regions'
          ]
        },
        {
          type: 'heading',
          content: 'Types of wager requirements:'
        },
        {
          type: 'list',
          items: [
            'Deposit + Bonus amount wagering (most common)',
            'Bonus amount only wagering',
            'Deposit amount wagering (rare, for specific promotions)',
            'Winnings wagering (for free spins/bets)',
            'Mixed requirements for different game types'
          ]
        },
        {
          type: 'heading',
          content: 'How to check your wager requirements:'
        },
        {
          type: 'list',
          items: [
            'Go to your Account Dashboard',
            'Check "Bonus Status" or "Wagering Progress"',
            'View remaining wagering amount',
            'See eligible games for wagering',
            'Monitor progress towards completion'
          ]
        },
        {
          type: 'heading',
          content: 'Games that contribute to wagering:'
        },
        {
          type: 'list',
          items: [
            'Slots: Usually 100% contribution',
            'Table games: Often 10-25% contribution',
            'Live dealer games: Typically 10% contribution',
            'Sports betting: Usually 100% contribution',
            'Some games may be restricted entirely'
          ]
        },
        {
          type: 'warning',
          content: 'Attempting to withdraw funds before completing wager requirements may result in forfeiture of bonus funds and associated winnings.'
        },
        {
          type: 'text',
          content: 'Regular deposits without bonuses typically have no wager requirements and can be withdrawn immediately (subject to verification).'
        },
        {
          type: 'button',
          text: 'Check My Wagering Status',
          action: 'check-wagering-status'
        }
      ]
    }
  },
  
  'Setting Betting Limits': {
    title: 'Setting Betting Limits',
    updated: 'Updated today',
    content: {
      sections: [
        {
          type: 'text',
          content: 'Setting betting limits helps you manage your gambling activities responsibly.'
        },
        {
          type: 'heading',
          content: 'Why Set Limits?'
        },
        {
          type: 'list',
          items: [
            'Helps control spending',
            'Promotes responsible gambling',
            'Prevents gambling-related problems'
          ]
        },
        {
          type: 'heading',
          content: 'How to Set Limits?'
        },
        {
          type: 'list',
          items: [
            'Go to Account Settings',
            'Select Betting Limits',
            'Choose the desired limits for each game type',
            'Confirm your settings'
          ]
        },
        {
          type: 'button',
          text: 'Set Your Limits',
          action: 'set-betting-limits'
        }
      ]
    }
  },
  'Understanding Betting Limits for Table Games': {
    title: 'Understanding Betting Limits for Table Games',
    updated: 'Updated today',
    content: {
      sections: [
        {
          type: 'text',
          content: 'Betting limits for table games ensure fair play and enable players to set personal limits.'
        },
        {
          type: 'heading',
          content: 'Table Game Limits'
        },
        {
          type: 'list',
          items: [
            'Minimum and maximum bet amounts',
            'Maximum daily losses',
            'Time limits for sessions'
          ]
        },
        {
          type: 'heading',
          content: 'Adjusting Table Game Limits'
        },
        {
          type: 'list',
          items: [
            'Navigate to Game Preferences',
            'Select Table Games',
            'Adjust your betting limits',
            'Save changes'
          ]
        },
        {
          type: 'button',
          text: 'Adjust Limits',
          action: 'adjust-table-game-limits'
        }
      ]
    }
  },
  'How to Adjust Sports Betting Limits': {
    title: 'How to Adjust Sports Betting Limits',
    updated: 'Updated today',
    content: {
      sections: [
        {
          type: 'text',
          content: 'Sports betting limits allow you to manage your risk exposure effectively.'
        },
        {
          type: 'heading',
          content: 'Benefits of Sports Betting Limits'
        },
        {
          type: 'list',
          items: [
            'Controls betting sprees',
            'Keeps your spending in check',
            'Promotes disciplined betting'
          ]
        },
        {
          type: 'heading',
          content: 'Steps to Adjust Limits'
        },
        {
          type: 'list',
          items: [
            'Go to Sports Settings',
            'Select Sports Betting Limits',
            'Adjust your limits as needed',
            'Confirm and apply changes'
          ]
        },
        {
          type: 'button',
          text: 'Manage Sports Limits',
          action: 'manage-sports-limits'
        }
      ]
    }
  },
  
  // Troubleshooting Articles
  'How to Report Issues with Third Party Providers?': {
    title: 'How to Report Issues with Third Party Providers?',
    updated: 'Updated 1 day ago',
    content: {
      sections: [
        {
          type: 'text',
          content: 'When experiencing issues with third-party game providers, it\'s important to report them promptly so we can resolve the problem and ensure smooth gameplay for all users.'
        },
        {
          type: 'heading',
          content: 'Common third-party provider issues:'
        },
        {
          type: 'list',
          items: [
            'Games not loading properly',
            'Disconnections during gameplay',
            'Betting features not working correctly',
            'Graphics or audio problems',
            'Game freezing or crashing',
            'Bonus features not triggering'
          ]
        },
        {
          type: 'heading',
          content: 'Information to include when reporting:'
        },
        {
          type: 'list',
          items: [
            'Game name and provider (e.g., Pragmatic Play, Evolution Gaming)',
            'Exact time and date when the issue occurred',
            'Description of what happened',
            'Your device type and browser information',
            'Screenshots or screen recordings if possible',
            'Any error messages displayed'
          ]
        },
        {
          type: 'heading',
          content: 'How to report the issue:'
        },
        {
          type: 'list',
          items: [
            'Contact our live support immediately',
            'Provide all relevant details about the issue',
            'Include your bet ID if applicable',
            'Mention if you lost funds due to the issue',
            'Wait for our team to investigate',
            'Follow up if you don\'t receive a response within 24 hours'
          ]
        },
        {
          type: 'text',
          content: 'Our technical team works closely with game providers to resolve issues quickly. We may need to escalate the issue directly to the provider, which can take 24-72 hours for resolution.'
        },
        {
          type: 'warning',
          content: 'If you experienced a financial loss due to a technical issue, please report it immediately. We investigate all such reports and provide compensation when warranted.'
        },
        {
          type: 'button',
          text: 'Report Issue to Support',
          action: 'contact-support'
        }
      ]
    }
  },
  
  'What to do if a game freezes?': {
    title: 'What to do if a game freezes?',
    updated: 'Updated 1 day ago',
    content: {
      sections: [
        {
          type: 'text',
          content: 'Game freezes can be frustrating, especially during important gameplay moments. Here\'s what to do when a game stops responding or becomes unplayable.'
        },
        {
          type: 'heading',
          content: 'Immediate steps to take:'
        },
        {
          type: 'list',
          items: [
            'Do not immediately close the game tab or app',
            'Wait 30-60 seconds to see if the game recovers',
            'Take a screenshot showing the frozen state',
            'Note the exact time when the freeze occurred',
            'Check if other games are working normally'
          ]
        },
        {
          type: 'heading',
          content: 'Recovery attempts:'
        },
        {
          type: 'list',
          items: [
            'Try refreshing the game page (F5 or refresh button)',
            'Close and reopen the game',
            'Clear your browser cache and cookies',
            'Try using a different browser',
            'Restart your device if the issue persists',
            'Check your internet connection stability'
          ]
        },
        {
          type: 'heading',
          content: 'If you were in the middle of a bet:'
        },
        {
          type: 'list',
          items: [
            'Check your bet history for the outcome',
            'Look for the bet in your transaction history',
            'Contact support if the bet is missing or shows incorrect results',
            'Provide your bet ID and timestamp',
            'Do not place additional bets until the issue is resolved'
          ]
        },
        {
          type: 'heading',
          content: 'Prevention tips:'
        },
        {
          type: 'list',
          items: [
            'Ensure stable internet connection before playing',
            'Close unnecessary browser tabs',
            'Keep your browser updated to the latest version',
            'Avoid playing during peak internet usage times',
            'Use wired internet connection when possible',
            'Restart your device regularly to clear memory'
          ]
        },
        {
          type: 'text',
          content: 'Most game freezes are temporary and resolve automatically. However, if you experience frequent freezes, it may indicate a device or connection issue that needs attention.'
        },
        {
          type: 'warning',
          content: 'If a game freezes during a bonus round or while you have an active bet, contact support immediately with details. We can help recover your session or provide compensation if warranted.'
        },
        {
          type: 'button',
          text: 'Get Help with Frozen Game',
          action: 'contact-support'
        }
      ]
    }
  },
  // Casino General Info Articles
  'Which Casino Games save Bonuses and Free Spins?': {
    title: 'Which Casino Games save Bonuses and Free Spins?',
    updated: 'Updated today',
    content: {
      sections: [
        {
          type: 'text',
          content: 'Not all casino games will save your active bonuses and free spins when you switch between games or take breaks. Understanding which games preserve your bonus status helps you play more strategically.'
        },
        {
          type: 'heading',
          content: 'Games that save bonuses and free spins:'
        },
        {
          type: 'list',
          items: [
            'Most modern video slots from major providers',
            'Progressive jackpot slots',
            'Featured tournament games',
            'Live dealer games (for applicable bonuses)',
            'Stake Original games with bonus features'
          ]
        },
        {
          type: 'heading',
          content: 'Games that may not save progress:'
        },
        {
          type: 'list',
          items: [
            'Older slot games from certain providers',
            'Flash-based games (being phased out)',
            'Some table games with bonus rounds',
            'Demo/free play versions',
            'Games with technical limitations'
          ]
        },
        {
          type: 'heading',
          content: 'Best practices:'
        },
        {
          type: 'list',
          items: [
            'Complete bonus rounds before switching games',
            'Check the game description for save features',
            'Finish free spins sessions completely',
            'Contact support if you lose bonus progress',
            'Stick to one game during active bonuses when possible'
          ]
        },
        {
          type: 'warning',
          content: 'If you experience issues with saved bonuses or free spins, contact our support team immediately with your game details and approximate time of the issue.'
        },
        {
          type: 'button',
          text: 'Report Bonus Issue',
          action: 'contact-support'
        }
      ]
    }
  },
  
  'How do I find my Casino Bet ID?': {
    title: 'How do I find my Casino Bet ID?',
    updated: 'Updated today',
    content: {
      sections: [
        {
          type: 'text',
          content: 'Your Casino Bet ID is a unique identifier for each bet you place. This ID is essential when reporting issues, disputing results, or tracking specific bets.'
        },
        {
          type: 'heading',
          content: 'Where to find your Bet ID:'
        },
        {
          type: 'list',
          items: [
            'In your bet history/transaction log',
            'On the game screen after placing a bet',
            'In email confirmations (if enabled)',
            'In your account dashboard under recent activity',
            'In the game\'s bet slip or results screen'
          ]
        },
        {
          type: 'heading',
          content: 'How to access your bet history:'
        },
        {
          type: 'list',
          items: [
            'Go to your Account Dashboard',
            'Click on "Transaction History" or "Bet History"',
            'Filter by "Casino" or "All Games"',
            'Select the date range you want to view',
            'Find your specific bet and copy the Bet ID'
          ]
        },
        {
          type: 'heading',
          content: 'Bet ID format examples:'
        },
        {
          type: 'list',
          items: [
            'Slots: Usually 10-15 digit numbers',
            'Table games: May include letters and numbers',
            'Live dealer: Often starts with provider code',
            'Stake Originals: Unique format per game type'
          ]
        },
        {
          type: 'text',
          content: 'Always copy the complete Bet ID when contacting support. Partial IDs cannot be used to locate your specific bet.'
        },
        {
          type: 'button',
          text: 'View My Bet History',
          action: 'view-bet-history'
        }
      ]
    }
  },
  
  'Provable Fairness for Stake Original Games': {
    title: 'Provable Fairness for Stake Original Games',
    updated: 'Updated today',
    content: {
      sections: [
        {
          type: 'text',
          content: 'Provable fairness is a technology that allows you to verify that the outcome of each bet was determined fairly and randomly, without any manipulation by the house.'
        },
        {
          type: 'heading',
          content: 'How provable fairness works:'
        },
        {
          type: 'list',
          items: [
            'Each bet uses a unique server seed (hidden until after the bet)',
            'You can set your own client seed for additional randomness',
            'A nonce (number used once) ensures each bet is unique',
            'After the bet, you can verify the result using these seeds',
            'The verification process is completely transparent'
          ]
        },
        {
          type: 'heading',
          content: 'Games with provable fairness:'
        },
        {
          type: 'list',
          items: [
            'Crash - verify the crash point calculation',
            'Dice - confirm the dice roll was random',
            'Mines - verify mine placement',
            'Blackjack - check card shuffling and dealing',
            'Roulette - verify the winning number selection'
          ]
        },
        {
          type: 'heading',
          content: 'How to verify your bets:'
        },
        {
          type: 'list',
          items: [
            'Go to the specific Stake Original game',
            'Find the "Provably Fair" or "Verify" section',
            'Enter your bet details (server seed, client seed, nonce)',
            'Run the verification to see the calculation',
            'Compare the result with your actual bet outcome'
          ]
        },
        {
          type: 'heading',
          content: 'Benefits of provable fairness:'
        },
        {
          type: 'list',
          items: [
            'Complete transparency in game outcomes',
            'Mathematical proof of fair play',
            'Ability to verify any suspicious results',
            'Increased trust between player and platform',
            'Industry-leading standard for online gaming'
          ]
        },
        {
          type: 'text',
          content: 'You can change your client seed at any time to ensure maximum randomness. We recommend changing it periodically for optimal security.'
        },
        {
          type: 'button',
          text: 'Learn More About Provable Fairness',
          action: 'provable-fairness-info'
        }
      ]
    }
  },
  
  // Sports Articles
  'What is a Multi Bet?': {
    title: 'What is a Multi Bet?',
    updated: 'Updated 2 days ago',
    content: {
      sections: [
        {
          type: 'text',
          content: 'A Multi Bet (also known as an accumulator or parlay) allows you to combine multiple individual bets into one single bet. All selections must win for your Multi Bet to be successful, but the potential payout is much higher than individual bets.'
        },
        {
          type: 'heading',
          content: 'How Multi Bets work:'
        },
        {
          type: 'list',
          items: [
            'Select 2 or more events to add to your bet slip',
            'Choose the "Multi Bet" option',
            'Enter your stake amount',
            'All selections must win for the bet to be successful',
            'Odds are multiplied together for higher potential returns'
          ]
        },
        {
          type: 'heading',
          content: 'Multi Bet example:'
        },
        {
          type: 'text',
          content: 'If you bet on Team A at 2.00 odds, Team B at 1.50 odds, and Team C at 3.00 odds, your total Multi Bet odds would be 2.00 × 1.50 × 3.00 = 9.00 odds.'
        },
        {
          type: 'heading',
          content: 'Important considerations:'
        },
        {
          type: 'list',
          items: [
            'Higher risk as all selections must win',
            'Higher potential rewards than single bets',
            'Maximum number of selections varies by sport',
            'Some promotions may apply to Multi Bets'
          ]
        },
        {
          type: 'button',
          text: 'Place Multi Bet',
          action: 'place-multi-bet'
        }
      ]
    }
  },
  
  'What is a Same Game Multi?': {
    title: 'What is a Same Game Multi?',
    updated: 'Updated 3 days ago',
    content: {
      sections: [
        {
          type: 'text',
          content: 'A Same Game Multi allows you to combine multiple betting markets from the same sporting event into one bet. This gives you the opportunity to create more exciting and potentially profitable bets on a single game.'
        },
        {
          type: 'heading',
          content: 'How Same Game Multi works:'
        },
        {
          type: 'list',
          items: [
            'Select multiple markets from the same game',
            'Examples: Team to win + Over 2.5 goals + Player to score',
            'All selections must be correct to win',
            'Odds are combined for higher potential payouts',
            'Available for major sports and events'
          ]
        },
        {
          type: 'heading',
          content: 'Popular Same Game Multi combinations:'
        },
        {
          type: 'list',
          items: [
            'Football: Team to win + Both teams to score + Total goals',
            'Basketball: Team to win + Player points + Total points',
            'Tennis: Match winner + Set betting + Total games',
            'Cricket: Match winner + Top batsman + Total runs'
          ]
        },
        {
          type: 'warning',
          content: 'Not all betting markets can be combined in a Same Game Multi due to correlation between outcomes.'
        },
        {
          type: 'button',
          text: 'Explore Same Game Multi',
          action: 'same-game-multi'
        }
      ]
    }
  },
  
  'What is a Single Bet?': {
    title: 'What is a Single Bet?',
    updated: 'Updated 1 week ago',
    content: {
      sections: [
        {
          type: 'text',
          content: 'A Single Bet is the most straightforward type of sports bet where you wager on one outcome of one sporting event. It\'s the foundation of sports betting and perfect for beginners.'
        },
        {
          type: 'heading',
          content: 'How Single Bets work:'
        },
        {
          type: 'list',
          items: [
            'Choose one outcome from one sporting event',
            'Place your stake on that selection',
            'If your selection wins, you receive your stake back plus winnings',
            'If your selection loses, you lose your stake',
            'Simple calculation: Stake × Odds = Total return'
          ]
        },
        {
          type: 'heading',
          content: 'Types of Single Bet markets:'
        },
        {
          type: 'list',
          items: [
            'Match Winner (1X2)',
            'Over/Under totals',
            'Handicap betting',
            'Both teams to score',
            'First goalscorer',
            'Correct score'
          ]
        },
        {
          type: 'heading',
          content: 'Advantages of Single Bets:'
        },
        {
          type: 'list',
          items: [
            'Lower risk compared to Multi Bets',
            'Easy to understand and calculate',
            'Good for building betting experience',
            'Each bet is independent of others'
          ]
        },
        {
          type: 'button',
          text: 'Place Single Bet',
          action: 'place-single-bet'
        }
      ]
    }
  },
  
  'How do Asian Totals work?': {
    title: 'How do Asian Totals work?',
    updated: 'Updated 4 days ago',
    content: {
      sections: [
        {
          type: 'text',
          content: 'Asian Totals (also known as Asian Over/Under) is a betting market that eliminates the possibility of a push by using quarter and half numbers. This creates more precise betting options and different payout scenarios.'
        },
        {
          type: 'heading',
          content: 'How Asian Totals work:'
        },
        {
          type: 'list',
          items: [
            'Uses half-goal increments (2.5, 3.0, 3.5, etc.)',
            'Quarter-goal lines split your bet between two totals',
            'No possibility of a push with half-goal lines',
            'Quarter-goal lines can result in half-win or half-loss',
            'More betting options than traditional totals'
          ]
        },
        {
          type: 'heading',
          content: 'Asian Total examples:'
        },
        {
          type: 'list',
          items: [
            'Over 2.5: All goals must be 3 or more to win',
            'Over 2.75: Half bet on 2.5, half on 3.0',
            'Over 3.0: Push if exactly 3 goals, win if more',
            'Over 3.25: Half bet on 3.0, half on 3.5'
          ]
        },
        {
          type: 'heading',
          content: 'Quarter-goal line outcomes:'
        },
        {
          type: 'list',
          items: [
            'Full win: Both halves of the bet win',
            'Half win: One half wins, one half pushes',
            'Push: Stake returned (whole number lines only)',
            'Half loss: One half loses, one half pushes',
            'Full loss: Both halves of the bet lose'
          ]
        },
        {
          type: 'button',
          text: 'Try Asian Totals',
          action: 'asian-totals'
        }
      ]
    }
  },
  
  'What does it mean when a bet is voided?': {
    title: 'What does it mean when a bet is voided?',
    updated: 'Updated 2 days ago',
    content: {
      sections: [
        {
          type: 'text',
          content: 'A voided bet means your wager has been cancelled and your stake will be returned to your account. This happens when certain circumstances make it impossible or unfair to settle the bet normally.'
        },
        {
          type: 'heading',
          content: 'Common reasons for voided bets:'
        },
        {
          type: 'list',
          items: [
            'Event cancelled or postponed beyond our time limits',
            'Venue changed after bet placement',
            'Player doesn\'t participate (player markets)',
            'Technical errors or incorrect odds',
            'Regulatory or legal issues',
            'Weather-related cancellations'
          ]
        },
        {
          type: 'heading',
          content: 'What happens to voided bets:'
        },
        {
          type: 'list',
          items: [
            'Single bets: Full stake returned',
            'Multi bets: Voided selection removed, odds recalculated',
            'Same Game Multi: Entire bet may be voided',
            'Live bets: Settled at time of voiding'
          ]
        },
        {
          type: 'heading',
          content: 'Time limits for postponed events:'
        },
        {
          type: 'list',
          items: [
            'Football: Must start within 24 hours',
            'Tennis: Must start within 24 hours',
            'Cricket: Must start within 48 hours',
            'Other sports: Check specific sport rules'
          ]
        },
        {
          type: 'text',
          content: 'If you believe a bet has been incorrectly voided, please contact our support team with your bet details for review.'
        },
        {
          type: 'button',
          text: 'Contact Support',
          action: 'contact-support'
        }
      ]
    }
  },
  
  'Why is Cashout not available for my bet?': {
    title: 'Why is Cashout not available for my bet?',
    updated: 'Updated 1 day ago',
    content: {
      sections: [
        {
          type: 'text',
          content: 'Cashout allows you to settle your bet early for a guaranteed return before the event concludes. However, Cashout is not always available due to various factors related to the bet type, market conditions, and event status.'
        },
        {
          type: 'heading',
          content: 'Reasons Cashout may not be available:'
        },
        {
          type: 'list',
          items: [
            'Bet type doesn\'t support Cashout',
            'Event is currently live and odds are suspended',
            'Market is temporarily suspended',
            'Very close to event start or finish',
            'Technical issues with live data feed',
            'Bet includes enhanced odds or promotions'
          ]
        },
        {
          type: 'heading',
          content: 'Bet types that typically support Cashout:'
        },
        {
          type: 'list',
          items: [
            'Single bets on major markets',
            'Multi bets (when all selections support it)',
            'Live bets during active play',
            'Pre-match bets on popular sports'
          ]
        },
        {
          type: 'heading',
          content: 'Bet types with limited Cashout:'
        },
        {
          type: 'list',
          items: [
            'Enhanced odds promotions',
            'Free bet stakes',
            'Some specialty markets',
            'Very small markets or leagues',
            'Bets placed with bonus funds'
          ]
        },
        {
          type: 'heading',
          content: 'When Cashout becomes unavailable:'
        },
        {
          type: 'list',
          items: [
            'Goals scored or major events in live games',
            'Final minutes of sporting events',
            'During VAR reviews or official reviews',
            'When odds become too volatile'
          ]
        },
        {
          type: 'text',
          content: 'Cashout availability can change throughout an event. If Cashout is currently unavailable, it may become available again as the event progresses.'
        },
        {
          type: 'button',
          text: 'Learn More About Cashout',
          action: 'cashout-info'
        }
      ]
    }
  },
  
  'How to find your Sports Bet ID?': {
    title: 'How to find your Sports Bet ID?',
    updated: 'Updated 3 days ago',
    content: {
      sections: [
        {
          type: 'text',
          content: 'Your Sports Bet ID is a unique identifier for each sports bet you place. This ID is essential when contacting support about specific bets, tracking bet history, or resolving any disputes.'
        },
        {
          type: 'heading',
          content: 'Where to find your Sports Bet ID:'
        },
        {
          type: 'list',
          items: [
            'Go to "My Account" or "Bet History"',
            'Select "Sports" from the filter options',
            'Find your specific bet in the list',
            'The Bet ID is usually displayed prominently',
            'You can also find it in email confirmations'
          ]
        },
        {
          type: 'heading',
          content: 'Sports Bet ID format:'
        },
        {
          type: 'list',
          items: [
            'Usually 10-15 characters long',
            'Contains numbers and sometimes letters',
            'Format: Example - SB123456789',
            'Each bet has a unique ID',
            'Multi bets have one ID for the entire bet'
          ]
        },
        {
          type: 'heading',
          content: 'Alternative ways to find Bet ID:'
        },
        {
          type: 'list',
          items: [
            'Check your bet confirmation email',
            'Look in your account notifications',
            'Use the bet timestamp to locate it',
            'Filter by bet amount or sport type',
            'Contact support with bet details'
          ]
        },
        {
          type: 'heading',
          content: 'When you might need your Sports Bet ID:'
        },
        {
          type: 'list',
          items: [
            'Disputing a bet settlement',
            'Asking about delayed settlements',
            'Requesting bet history information',
            'Reporting technical issues with a bet',
            'Cashout inquiries'
          ]
        },
        {
          type: 'text',
          content: 'Always provide the complete Bet ID when contacting support. Partial IDs cannot be used to locate your specific sports bet.'
        },
        {
          type: 'button',
          text: 'View My Sports Bet History',
          action: 'view-sports-history'
        }
      ]
    }
  },
  
  'What is the 3-Way European Handicap Bet and how does it work?': {
    title: 'What is the 3-Way European Handicap Bet and how does it work?',
    updated: 'Updated 5 days ago',
    content: {
      sections: [
        {
          type: 'text',
          content: 'The 3-Way European Handicap (also known as European Handicap or 3-Way Handicap) is a betting market that gives one team a virtual advantage or disadvantage, while still offering three possible outcomes: Home Win, Draw, or Away Win.'
        },
        {
          type: 'heading',
          content: 'How 3-Way European Handicap works:'
        },
        {
          type: 'list',
          items: [
            'One team receives a goal advantage (+1, +2, etc.)',
            'The other team receives a goal disadvantage (-1, -2, etc.)',
            'The handicap is applied to the final score',
            'Three outcomes remain possible after handicap',
            'Draw is possible even with whole number handicaps'
          ]
        },
        {
          type: 'heading',
          content: 'Example: Team A vs Team B (-1)'
        },
        {
          type: 'text',
          content: 'If Team B is given a -1 handicap and the actual score is Team A 1-2 Team B, the handicap result would be Team A 1-1 Team B (a draw with handicap applied).'
        },
        {
          type: 'heading',
          content: 'Possible outcomes with handicap:'
        },
        {
          type: 'list',
          items: [
            'Home Win: Home team wins after handicap applied',
            'Draw: Teams are level after handicap applied',
            'Away Win: Away team wins after handicap applied'
          ]
        },
        {
          type: 'heading',
          content: 'Difference from Asian Handicap:'
        },
        {
          type: 'list',
          items: [
            'European: Always three outcomes, draw possible',
            'Asian: Usually two outcomes, stakes returned on draw',
            'European: Uses whole numbers only',
            'Asian: Uses half and quarter numbers',
            'European: No stake returns on draws'
          ]
        },
        {
          type: 'heading',
          content: 'When to use 3-Way European Handicap:'
        },
        {
          type: 'list',
          items: [
            'When there\'s a clear favorite and underdog',
            'To get better odds on the favorite',
            'When you predict a close match',
            'For more balanced betting options'
          ]
        },
        {
          type: 'button',
          text: 'Try European Handicap Betting',
          action: 'european-handicap'
        }
      ]
    }
  },
  
  // Monthly Bonuses Articles
  'What is the Monthly Bonus?': {
    title: 'What is the Monthly Bonus?',
    updated: 'Updated 3 days ago',
    content: {
      sections: [
        {
          type: 'text',
          content: 'The Monthly Bonus is a reward system that gives eligible players a percentage of their net losses back as bonus funds at the end of each calendar month. It\'s our way of giving back to loyal players who are active on our platform.'
        },
        {
          type: 'heading',
          content: 'How the Monthly Bonus works:'
        },
        {
          type: 'list',
          items: [
            'Calculated based on your net losses for the calendar month',
            'Percentage returned varies based on your VIP level',
            'Automatically credited to eligible accounts on the 1st of each month',
            'Available for both casino games and sports betting',
            'Bonus funds have wagering requirements before withdrawal'
          ]
        },
        {
          type: 'heading',
          content: 'Monthly Bonus percentages by VIP level:'
        },
        {
          type: 'list',
          items: [
            'Bronze: 5% of net losses',
            'Silver: 10% of net losses',
            'Gold: 15% of net losses',
            'Platinum: 20% of net losses',
            'Diamond: 25% of net losses'
          ]
        },
        {
          type: 'heading',
          content: 'Eligibility requirements:'
        },
        {
          type: 'list',
          items: [
            'Minimum $100 wagered during the month',
            'Account must be fully verified',
            'No bonus abuse or violation of terms',
            'Account must be active for the entire month',
            'Minimum net loss of $50 required'
          ]
        },
        {
          type: 'text',
          content: 'The Monthly Bonus is calculated automatically and there\'s no need to opt-in. If you\'re eligible, it will appear in your account on the first day of the following month.'
        },
        {
          type: 'button',
          text: 'Check My VIP Status',
          action: 'check-vip-status'
        }
      ]
    }
  },
  
  'How do I become eligible for the Monthly Bonus?': {
    title: 'How do I become eligible for the Monthly Bonus?',
    updated: 'Updated 2 days ago',
    content: {
      sections: [
        {
          type: 'text',
          content: 'To become eligible for the Monthly Bonus, you need to meet specific activity and account requirements during the calendar month. Here\'s everything you need to know about qualifying for this reward.'
        },
        {
          type: 'heading',
          content: 'Basic eligibility requirements:'
        },
        {
          type: 'list',
          items: [
            'Complete account verification (Level 2 KYC)',
            'Wager at least $100 during the calendar month',
            'Have net losses of at least $50 for the month',
            'Maintain an active account without violations',
            'Account must be registered before the last day of the month'
          ]
        },
        {
          type: 'heading',
          content: 'Activities that count toward eligibility:'
        },
        {
          type: 'list',
          items: [
            'Casino games (slots, table games, live casino)',
            'Sports betting (pre-match and live bets)',
            'Poker games and tournaments',
            'Original games (Crash, Dice, Mines, etc.)',
            'Virtual sports betting'
          ]
        },
        {
          type: 'heading',
          content: 'What disqualifies you from the Monthly Bonus:'
        },
        {
          type: 'list',
          items: [
            'Bonus abuse or system exploitation',
            'Multiple account violations',
            'Incomplete account verification',
            'Self-exclusion or account restrictions during the month',
            'Chargebacks or payment disputes'
          ]
        },
        {
          type: 'heading',
          content: 'Tips to ensure eligibility:'
        },
        {
          type: 'list',
          items: [
            'Complete your account verification early in the month',
            'Maintain consistent activity throughout the month',
            'Avoid any terms of service violations',
            'Keep your account information up to date',
            'Play responsibly and within your limits'
          ]
        },
        {
          type: 'warning',
          content: 'Eligibility is determined automatically at the end of each month. Manual reviews may be conducted for accounts with unusual activity patterns.'
        },
        {
          type: 'text',
          content: 'If you believe you should be eligible but didn\'t receive the Monthly Bonus, contact our support team within 7 days of the month end for review.'
        },
        {
          type: 'button',
          text: 'Complete Account Verification',
          action: 'complete-verification'
        }
      ]
    }
  },
  
  'When is the Monthly Bonus sent out?': {
    title: 'When is the Monthly Bonus sent out?',
    updated: 'Updated 1 day ago',
    content: {
      sections: [
        {
          type: 'text',
          content: 'The Monthly Bonus is distributed automatically on the first day of each month for the previous month\'s activity. Here\'s the detailed timeline and what to expect during the distribution process.'
        },
        {
          type: 'heading',
          content: 'Monthly Bonus distribution schedule:'
        },
        {
          type: 'list',
          items: [
            'Distribution date: 1st day of each month',
            'Processing time: Between 00:00 - 12:00 UTC',
            'Calculation period: Previous calendar month (1st to last day)',
            'Notification: Email sent to eligible recipients',
            'Account credit: Appears in bonus balance immediately'
          ]
        },
        {
          type: 'heading',
          content: 'Example timeline:'
        },
        {
          type: 'text',
          content: 'For January activity: Monthly Bonus calculated and distributed on February 1st. For February activity: Monthly Bonus calculated and distributed on March 1st, and so on.'
        },
        {
          type: 'heading',
          content: 'What happens if the 1st falls on a weekend or holiday:'
        },
        {
          type: 'list',
          items: [
            'Distribution continues as scheduled (automated system)',
            'No delays for weekends or public holidays',
            'Processing may take slightly longer during high-volume periods',
            'Support team available for queries during business hours'
          ]
        },
        {
          type: 'heading',
          content: 'How you\'ll be notified:'
        },
        {
          type: 'list',
          items: [
            'Email notification sent to registered email address',
            'Bonus appears in your account balance',
            'Transaction history shows the Monthly Bonus credit',
            'VIP dashboard displays bonus details',
            'Push notifications (if enabled in mobile app)'
          ]
        },
        {
          type: 'heading',
          content: 'If you don\'t receive your expected bonus:'
        },
        {
          type: 'list',
          items: [
            'Wait until 12:00 UTC on the 1st before contacting support',
            'Check your email (including spam folder) for notifications',
            'Review your eligibility requirements for the previous month',
            'Contact support with your account details if still missing',
            'Allow up to 24 hours for manual processing if needed'
          ]
        },
        {
          type: 'text',
          content: 'The distribution process is fully automated, ensuring fair and timely delivery to all eligible players. Any technical issues are resolved quickly by our team.'
        },
        {
          type: 'button',
          text: 'Check My Bonus History',
          action: 'check-bonus-history'
        }
      ]
    }
  },
  
  'How is the Monthly Bonus calculated?': {
    title: 'How is the Monthly Bonus calculated?',
    updated: 'Updated 4 days ago',
    content: {
      sections: [
        {
          type: 'text',
          content: 'The Monthly Bonus calculation is based on your net losses during the calendar month, multiplied by your VIP level percentage. Understanding this calculation helps you maximize your bonus potential.'
        },
        {
          type: 'heading',
          content: 'Basic calculation formula:'
        },
        {
          type: 'text',
          content: 'Monthly Bonus = Net Losses × VIP Level Percentage'
        },
        {
          type: 'heading',
          content: 'How net losses are calculated:'
        },
        {
          type: 'list',
          items: [
            'Total amount wagered minus total winnings',
            'Includes all eligible games and sports betting',
            'Calculated in your primary currency',
            'Bonuses and free bet stakes are excluded from calculation',
            'Only real money activity counts toward the calculation'
          ]
        },
        {
          type: 'heading',
          content: 'VIP level multipliers:'
        },
        {
          type: 'list',
          items: [
            'Bronze (Level 1): 5% of net losses',
            'Silver (Level 2): 10% of net losses',
            'Gold (Level 3): 15% of net losses',
            'Platinum (Level 4): 20% of net losses',
            'Diamond (Level 5): 25% of net losses'
          ]
        },
        {
          type: 'heading',
          content: 'Calculation example:'
        },
        {
          type: 'text',
          content: 'Player at Gold level with $1,000 net losses: Monthly Bonus = $1,000 × 15% = $150 bonus credit'
        },
        {
          type: 'heading',
          content: 'What\'s included in the calculation:'
        },
        {
          type: 'list',
          items: [
            'Casino games (slots, table games, live dealer)',
            'Sports betting (all bet types and outcomes)',
            'Poker cash games and tournaments',
            'Original games (Crash, Dice, Mines, etc.)',
            'Virtual sports and esports betting'
          ]
        },
        {
          type: 'heading',
          content: 'What\'s excluded from the calculation:'
        },
        {
          type: 'list',
          items: [
            'Bonus money bets and winnings',
            'Free spins and free bet activity',
            'Voided or cancelled bets',
            'Demo play or practice games',
            'Promotional tournament entries'
          ]
        },
        {
          type: 'heading',
          content: 'Important notes:'
        },
        {
          type: 'list',
          items: [
            'Net losses must be at least $50 to qualify',
            'Calculation is done automatically at month-end',
            'VIP level is determined by your status at month-end',
            'Currency conversion uses month-end exchange rates',
            'Minimum bonus payout is $5'
          ]
        },
        {
          type: 'warning',
          content: 'If you have net winnings for the month (more winnings than losses), you will not be eligible for the Monthly Bonus as there are no net losses to calculate from.'
        },
        {
          type: 'button',
          text: 'View My Monthly Statistics',
          action: 'view-monthly-stats'
        }
      ]
    }
  },
  
  'How do I get a higher Monthly Bonus next time?': {
    title: 'How do I get a higher Monthly Bonus next time?',
    updated: 'Updated 5 days ago',
    content: {
      sections: [
        {
          type: 'text',
          content: 'There are several legitimate ways to increase your Monthly Bonus amount for future months. The key is advancing your VIP level and maintaining consistent, responsible gaming activity.'
        },
        {
          type: 'heading',
          content: 'Primary ways to increase your Monthly Bonus:'
        },
        {
          type: 'list',
          items: [
            'Advance to a higher VIP level for better percentage rates',
            'Maintain consistent monthly activity',
            'Participate in VIP-exclusive promotions',
            'Complete monthly challenges and missions',
            'Refer friends to boost your VIP progress'
          ]
        },
        {
          type: 'heading',
          content: 'How to advance your VIP level:'
        },
        {
          type: 'list',
          items: [
            'Increase your total wagering volume',
            'Play consistently across multiple months',
            'Participate in tournaments and special events',
            'Complete VIP missions and challenges',
            'Maintain a positive account standing'
          ]
        },
        {
          type: 'heading',
          content: 'VIP level progression requirements:'
        },
        {
          type: 'list',
          items: [
            'Bronze to Silver: $10,000 total wagered',
            'Silver to Gold: $50,000 total wagered',
            'Gold to Platinum: $250,000 total wagered',
            'Platinum to Diamond: $1,000,000 total wagered'
          ]
        },
        {
          type: 'heading',
          content: 'Additional benefits of higher VIP levels:'
        },
        {
          type: 'list',
          items: [
            'Higher Monthly Bonus percentages',
            'Exclusive VIP tournaments and events',
            'Personal account manager',
            'Faster withdrawal processing',
            'Higher betting limits',
            'Birthday and anniversary bonuses'
          ]
        },
        {
          type: 'heading',
          content: 'Strategies to maximize your bonus potential:'
        },
        {
          type: 'list',
          items: [
            'Focus on games with lower house edge',
            'Take advantage of reload bonuses throughout the month',
            'Participate in monthly races and competitions',
            'Use responsible gambling tools to manage your play',
            'Time your bigger sessions strategically within the month'
          ]
        },
        {
          type: 'heading',
          content: 'Things to avoid:'
        },
        {
          type: 'list',
          items: [
            'Bonus abuse or system exploitation attempts',
            'Irregular or suspicious betting patterns',
            'Multiple account creation',
            'Violating terms of service',
            'Chasing losses beyond your budget'
          ]
        },
        {
          type: 'warning',
          content: 'Remember to gamble responsibly. Never bet more than you can afford to lose, and use our responsible gambling tools if needed. The Monthly Bonus should be seen as a nice reward, not a primary source of income.'
        },
        {
          type: 'text',
          content: 'Your VIP progress is tracked automatically, and you can always check your current status and requirements for the next level in your account dashboard.'
        },
        {
          type: 'button',
          text: 'View VIP Progress',
          action: 'view-vip-progress'
        }
      ]
    }
  },
  
  'What is the Pre-Monthly and Post-Monthly Bonus?': {
    title: 'What is the Pre-Monthly and Post-Monthly Bonus?',
    updated: 'Updated 1 week ago',
    content: {
      sections: [
        {
          type: 'text',
          content: 'Pre-Monthly and Post-Monthly Bonuses are special promotional bonuses that complement the regular Monthly Bonus. These bonuses are designed to reward players during specific promotional periods and provide additional value.'
        },
        {
          type: 'heading',
          content: 'Pre-Monthly Bonus:'
        },
        {
          type: 'list',
          items: [
            'Distributed mid-month (around the 15th)',
            'Based on the first half of the month\'s activity',
            'Usually 50% of what your monthly bonus would be',
            'Available during special promotional periods',
            'Does not affect your regular Monthly Bonus calculation'
          ]
        },
        {
          type: 'heading',
          content: 'Post-Monthly Bonus:'
        },
        {
          type: 'list',
          items: [
            'Distributed a few days after the regular Monthly Bonus',
            'Additional bonus on top of your Monthly Bonus',
            'Usually 25-50% extra of your Monthly Bonus amount',
            'Available during special celebration periods',
            'Announced via email and promotional campaigns'
          ]
        },
        {
          type: 'heading',
          content: 'When these bonuses are available:'
        },
        {
          type: 'list',
          items: [
            'Holiday seasons (Christmas, New Year, etc.)',
            'Platform anniversary celebrations',
            'Special VIP appreciation months',
            'Major sporting event periods',
            'Milestone celebrations (user milestones, etc.)'
          ]
        },
        {
          type: 'heading',
          content: 'Eligibility requirements:'
        },
        {
          type: 'list',
          items: [
            'Must be eligible for regular Monthly Bonus',
            'Account must be active during promotional period',
            'May require opt-in for certain promotions',
            'Higher VIP levels may have priority access',
            'Additional wagering requirements may apply'
          ]
        },
        {
          type: 'heading',
          content: 'How you\'ll know when they\'re available:'
        },
        {
          type: 'list',
          items: [
            'Email notifications about special bonus periods',
            'Promotional banners on the website',
            'VIP manager communication (for high-tier VIPs)',
            'Social media announcements',
            'In-app notifications and pop-ups'
          ]
        },
        {
          type: 'heading',
          content: 'Important notes:'
        },
        {
          type: 'list',
          items: [
            'These bonuses are not guaranteed every month',
            'Terms and conditions may vary for each promotion',
            'May have different wagering requirements',
            'Cannot be combined with certain other promotions',
            'Subject to availability and promotional calendar'
          ]
        },
        {
          type: 'text',
          content: 'Pre-Monthly and Post-Monthly Bonuses are special treats for our loyal players. Keep an eye on your email and promotional communications to make sure you don\'t miss out when they\'re available.'
        },
        {
          type: 'button',
          text: 'Subscribe to Promotions',
          action: 'subscribe-promotions'
        }
      ]
    }
  },
  
  'Which type of rewards can I receive with the Monthly Bonus?': {
    title: 'Which type of rewards can I receive with the Monthly Bonus?',
    updated: 'Updated 6 days ago',
    content: {
      sections: [
        {
          type: 'text',
          content: 'The Monthly Bonus can be awarded in various forms depending on your VIP level, preferences, and promotional periods. Understanding the different reward types helps you make the most of your monthly benefits.'
        },
        {
          type: 'heading',
          content: 'Standard Monthly Bonus rewards:'
        },
        {
          type: 'list',
          items: [
            'Bonus cash credit to your account',
            'Free spins on selected slot games',
            'Sports betting free bets',
            'Tournament tickets and entries',
            'Cashback credits (no wagering requirements)'
          ]
        },
        {
          type: 'heading',
          content: 'VIP-exclusive reward options:'
        },
        {
          type: 'list',
          items: [
            'Physical merchandise and gifts',
            'Experience packages (trips, events, etc.)',
            'Personalized bonus packages',
            'Higher percentage cashback options',
            'Exclusive tournament invitations'
          ]
        },
        {
          type: 'heading',
          content: 'Reward types by VIP level:'
        },
        {
          type: 'list',
          items: [
            'Bronze/Silver: Primarily bonus cash and free spins',
            'Gold: Mix of cash, free spins, and tournament tickets',
            'Platinum: Cashback options and exclusive tournaments',
            'Diamond: Choice of rewards including physical gifts'
          ]
        },
        {
          type: 'heading',
          content: 'Seasonal and special reward variations:'
        },
        {
          type: 'list',
          items: [
            'Holiday-themed bonuses and promotions',
            'Birthday month special rewards',
            'Anniversary celebration bonuses',
            'Major sporting event free bets',
            'Limited-time exclusive merchandise'
          ]
        },
        {
          type: 'heading',
          content: 'How to choose your reward type:'
        },
        {
          type: 'list',
          items: [
            'Higher VIP levels get reward selection options',
            'Email notification with available choices',
            'VIP dashboard shows reward preferences',
            'Contact VIP manager for custom reward packages',
            'Default rewards applied if no selection made'
          ]
        },
        {
          type: 'heading',
          content: 'Wagering requirements by reward type:'
        },
        {
          type: 'list',
          items: [
            'Bonus cash: Usually 25x-40x wagering requirement',
            'Free spins: 30x-50x on winnings',
            'Free bets: Winnings may have 1x requirement',
            'Tournament tickets: No wagering requirements',
            'Cashback: No wagering requirements'
          ]
        },
        {
          type: 'heading',
          content: 'How rewards are delivered:'
        },
        {
          type: 'list',
          items: [
            'Bonus cash: Instant credit to bonus balance',
            'Free spins: Available immediately on specified games',
            'Free bets: Added to sports betting account',
            'Tournament tickets: Automatically registered',
            'Physical rewards: Shipped to verified address'
          ]
        },
        {
          type: 'text',
          content: 'The variety of reward types ensures that every player can find value in their Monthly Bonus, whether they prefer immediate play credits or long-term benefits.'
        },
        {
          type: 'warning',
          content: 'All bonus rewards are subject to terms and conditions. Make sure to read the specific requirements for each reward type before claiming.'
        },
        {
          type: 'button',
          text: 'Set Reward Preferences',
          action: 'set-reward-preferences'
        }
      ]
    }
  },
  
  'When does the Monthly Bonus expire?': {
    title: 'When does the Monthly Bonus expire?',
    updated: 'Updated 1 week ago',
    content: {
      sections: [
        {
          type: 'text',
          content: 'Monthly Bonus rewards have specific expiration dates to ensure fair use and account activity. Understanding these timeframes helps you make the most of your bonus before it expires.'
        },
        {
          type: 'heading',
          content: 'Standard expiration periods:'
        },
        {
          type: 'list',
          items: [
            'Bonus cash: 30 days from credit date',
            'Free spins: 7 days from credit date',
            'Free bets: 30 days from credit date',
            'Tournament tickets: Until tournament start date',
            'Cashback credits: No expiration (real money)'
          ]
        },
        {
          type: 'heading',
          content: 'VIP level expiration benefits:'
        },
        {
          type: 'list',
          items: [
            'Bronze/Silver: Standard expiration periods',
            'Gold: 45 days for bonus cash',
            'Platinum: 60 days for bonus cash',
            'Diamond: 90 days for bonus cash, custom arrangements possible'
          ]
        },
        {
          type: 'heading',
          content: 'What happens when bonuses expire:'
        },
        {
          type: 'list',
          items: [
            'Unused bonus funds are automatically removed',
            'Partial wagering progress is lost',
            'Free spins become unavailable',
            'Free bets are removed from your account',
            'No refunds or extensions for expired bonuses'
          ]
        },
        {
          type: 'heading',
          content: 'How to check expiration dates:'
        },
        {
          type: 'list',
          items: [
            'Bonus dashboard shows all expiration dates',
            'Email notifications sent 7 days before expiry',
            'SMS alerts (if enabled) 24 hours before expiry',
            'Mobile app push notifications',
            'Account balance section displays time remaining'
          ]
        },
        {
          type: 'heading',
          content: 'Tips to avoid expiration:'
        },
        {
          type: 'list',
          items: [
            'Use bonuses soon after receiving them',
            'Set calendar reminders for expiration dates',
            'Enable email and SMS notifications',
            'Check your bonus balance regularly',
            'Plan your gaming sessions around bonus deadlines'
          ]
        },
        {
          type: 'heading',
          content: 'Extension policies:'
        },
        {
          type: 'list',
          items: [
            'No automatic extensions for expired bonuses',
            'VIP managers may provide extensions in special circumstances',
            'Technical issues may warrant extension consideration',
            'Medical emergencies may be considered (with documentation)',
            'Each case reviewed individually by management'
          ]
        },
        {
          type: 'heading',
          content: 'Special expiration rules:'
        },
        {
          type: 'list',
          items: [
            'Holiday bonuses may have extended expiration periods',
            'Promotional bonuses may have shorter expiration times',
            'Combined bonuses expire based on the earliest expiration date',
            'Wagering requirements must be met before expiration',
            'Partial fulfillment does not extend expiration dates'
          ]
        },
        {
          type: 'warning',
          content: 'Once a Monthly Bonus expires, it cannot be recovered or reactivated. Make sure to use your bonuses within the specified timeframe to avoid losing them.'
        },
        {
          type: 'text',
          content: 'Keep track of your bonus expiration dates and plan your gaming accordingly to maximize the value of your Monthly Bonus rewards.'
        },
        {
          type: 'button',
          text: 'Check My Active Bonuses',
          action: 'check-active-bonuses'
        }
      ]
    }
  },
  
  // Poker Tournament Features Articles
  'Tournament Registration and Buy-ins': {
    title: 'Tournament Registration and Buy-ins',
    updated: 'Updated today',
    content: {
      sections: [
        {
          type: 'text',
          content: 'Learn how to register for poker tournaments and understand the different buy-in structures available.'
        },
        {
          type: 'heading',
          content: 'Registration Process:'
        },
        {
          type: 'list',
          items: [
            'Navigate to the Poker tournament lobby',
            'Select your desired tournament',
            'Choose your buy-in amount',
            'Confirm registration and payment'
          ]
        },
        {
          type: 'button',
          text: 'View Active Tournaments',
          action: 'view-tournaments'
        }
      ]
    }
  },
  
  'Tournament Prize Structures': {
    title: 'Tournament Prize Structures',
    updated: 'Updated today',
    content: {
      sections: [
        {
          type: 'text',
          content: 'Understanding how tournament prizes are distributed among winners.'
        },
        {
          type: 'heading',
          content: 'Prize Distribution:'
        },
        {
          type: 'list',
          items: [
            'First place typically receives 30-40% of prize pool',
            'Prize distribution varies by tournament size',
            'Guaranteed tournaments have minimum prize pools',
            'Satellite tournaments offer main event seats'
          ]
        },
        {
          type: 'button',
          text: 'Check Prize Structures',
          action: 'check-prizes'
        }
      ]
    }
  },
  
  'Late Registration Rules': {
    title: 'Late Registration Rules',
    updated: 'Updated today',
    content: {
      sections: [
        {
          type: 'text',
          content: 'Learn about late registration policies and how they affect your tournament experience.'
        },
        {
          type: 'heading',
          content: 'Late Registration Guidelines:'
        },
        {
          type: 'list',
          items: [
            'Most tournaments allow late registration for first 3 levels',
            'You receive the same starting stack regardless of entry time',
            'Late registration closes at announced time',
            'Prize pool includes all late entries'
          ]
        },
        {
          type: 'button',
          text: 'Register for Tournament',
          action: 'tournament-register'
        }
      ]
    }
  },
  
  'Rebuy and Add-on Options': {
    title: 'Rebuy and Add-on Options',
    updated: 'Updated today',
    content: {
      sections: [
        {
          type: 'text',
          content: 'Understanding rebuy and add-on features in poker tournaments.'
        },
        {
          type: 'heading',
          content: 'Rebuy Rules:'
        },
        {
          type: 'list',
          items: [
            'Available when your stack falls below starting amount',
            'Only available during rebuy period',
            'Cost same as original buy-in',
            'Unlimited rebuys in most tournaments'
          ]
        },
        {
          type: 'button',
          text: 'Learn More About Rebuys',
          action: 'rebuy-info'
        }
      ]
    }
  },
  
  'Tournament Blind Levels': {
    title: 'Tournament Blind Levels',
    updated: 'Updated today',
    content: {
      sections: [
        {
          type: 'text',
          content: 'Learn how blind levels work and increase throughout poker tournaments.'
        },
        {
          type: 'heading',
          content: 'Blind Structure:'
        },
        {
          type: 'list',
          items: [
            'Blinds increase at regular intervals',
            'Level duration varies by tournament type',
            'Structure sheet available before tournament starts',
            'Ante may be introduced at higher levels'
          ]
        },
        {
          type: 'button',
          text: 'View Blind Structures',
          action: 'blind-structures'
        }
      ]
    }
  },
  
  'Heads-Up Final Table Rules': {
    title: 'Heads-Up Final Table Rules',
    updated: 'Updated today',
    content: {
      sections: [
        {
          type: 'text',
          content: 'Special rules and procedures for heads-up play at the final table.'
        },
        {
          type: 'heading',
          content: 'Heads-Up Rules:'
        },
        {
          type: 'list',
          items: [
            'Small blind acts first pre-flop',
            'Big blind acts first post-flop',
            'Blinds may increase more frequently',
            'Deal-making options may be available'
          ]
        },
        {
          type: 'button',
          text: 'Practice Heads-Up Play',
          action: 'heads-up-practice'
        }
      ]
    }
  },
  
  'Satellite Tournament System': {
    title: 'Satellite Tournament System',
    updated: 'Updated today',
    content: {
      sections: [
        {
          type: 'text',
          content: 'Satellite tournaments offer affordable paths to bigger tournaments and special events.'
        },
        {
          type: 'heading',
          content: 'How Satellites Work:'
        },
        {
          type: 'list',
          items: [
            'Win seats to higher buy-in tournaments',
            'Multiple satellites may run for same target event',
            'Winner receives tournament ticket, not cash',
            'Some satellites award multiple seats'
          ]
        },
        {
          type: 'button',
          text: 'Find Satellite Tournaments',
          action: 'find-satellites'
        }
      ]
    }
  },
  
  // Poker Game Types & Modes Articles
  'Texas Hold\'em Rules and Strategy': {
    title: 'Texas Hold\'em Rules and Strategy',
    updated: 'Updated today',
    content: {
      sections: [
        {
          type: 'text',
          content: 'Texas Hold\'em is the most popular poker variantg. Learn the basic rules and fundamental strategies.'
        },
        {
          type: 'heading',
          content: 'Game Rules:'
        },
        {
          type: 'list',
          items: [
            'Each player receives 2 hole cards',
            '5 community cards are dealt in stages',
            'Best 5-card hand wins the pot',
            'Betting rounds: Pre-flop, Flop, Turn, River'
          ]
        },
        {
          type: 'button',
          text: 'Play Texas Hold\'em',
          action: 'play-holdem'
        }
      ]
    }
  },
  
  'Omaha Poker Variations': {
    title: 'Omaha Poker Variations',
    updated: 'Updated today',
    content: {
      sections: [
        {
          type: 'text',
          content: 'Omaha is an exciting poker variant that offers more action than Hold\'em. Learn the different Omaha formats.'
        },
        {
          type: 'heading',
          content: 'Omaha Variations:'
        },
        {
          type: 'list',
          items: [
            'Omaha Hi - Highest hand wins',
            'Omaha Hi-Lo - Pot split between high and low hands',
            'Each player gets 4 hole cards',
            'Must use exactly 2 hole cards and 3 community cards'
          ]
        },
        {
          type: 'button',
          text: 'Try Omaha Games',
          action: 'play-omaha'
        }
      ]
    }
  },
  
  'Sit \u0026 Go Tournament Format': {
    title: 'Sit \u0026 Go Tournament Format',
    updated: 'Updated today',
    content: {
      sections: [
        {
          type: 'text',
          content: 'Sit \u0026 Go tournaments start as soon as enough players register. Perfect for quick poker action.'
        },
        {
          type: 'heading',
          content: 'S\u0026G Features:'
        },
        {
          type: 'list',
          items: [
            'Starts immediately when full',
            'Common formats: 6-max, 9-max, heads-up',
            'Faster blind increases than MTTs',
            'Typically last 30-90 minutes'
          ]
        },
        {
          type: 'button',
          text: 'Join Sit \u0026 Go',
          action: 'join-sng'
        }
      ]
    }
  },
  
  // Poker Table Features Articles
  'Multi-Table Tournament Features': {
    title: 'Multi-Table Tournament Features',
    updated: 'Updated today',
    content: {
      sections: [
        {
          type: 'text',
          content: 'Multi-table tournaments (MTTs) offer large prize pools and the chance to play against hundreds of players.'
        },
        {
          type: 'heading',
          content: 'MTT Features:'
        },
        {
          type: 'list',
          items: [
            'Automatic table balancing',
            'Players moved to balance tables',
            'Elimination leads to table consolidation',
            'Final table typically seats 8-10 players'
          ]
        },
        {
          type: 'button',
          text: 'View MTT Schedule',
          action: 'mtt-schedule'
        }
      ]
    }
  },
  
  'Cash Game Table Selection': {
    title: 'Cash Game Table Selection',
    updated: 'Updated today',
    content: {
      sections: [
        {
          type: 'text',
          content: 'Choose the right cash game table based on stakes, number of players, and game type.'
        },
        {
          type: 'heading',
          content: 'Table Selection Tips:'
        },
        {
          type: 'list',
          items: [
            'Choose stakes appropriate to your bankroll',
            '6-max tables offer more action',
            '9-max tables are more traditional',
            'Look for tables with recreational players'
          ]
        },
        {
          type: 'button',
          text: 'Find Cash Games',
          action: 'find-cash-games'
        }
      ]
    }
  },
  
  'Hand History and Statistics': {
    title: 'Hand History and Statistics',
    updated: 'Updated today',
    content: {
      sections: [
        {
          type: 'text',
          content: 'Review your poker hands and track your performance with detailed statistics and hand history.'
        },
        {
          type: 'heading',
          content: 'Available Statistics:'
        },
        {
          type: 'list',
          items: [
            'VPIP (Voluntarily Put money In Pot)',
            'PFR (Pre-Flop Raise)',
            'Aggression Factor',
            'Win Rate per hour/tournament'
          ]
        },
        {
          type: 'button',
          text: 'View My Statistics',
          action: 'view-stats'
        }
      ]
    }
  },
  
  'Table Chat and Player Notes': {
    title: 'Table Chat and Player Notes',
    updated: 'Updated today',
    content: {
      sections: [
        {
          type: 'text',
          content: 'Use table chat for social interaction and player notes to track opponent tendencies.'
        },
        {
          type: 'heading',
          content: 'Chat Features:'
        },
        {
          type: 'list',
          items: [
            'Real-time chat with other players',
            'Quick chat options available',
            'Chat can be disabled if preferred',
            'Moderation ensures respectful environment'
          ]
        },
        {
          type: 'button',
          text: 'Chat Settings',
          action: 'chat-settings'
        }
      ]
    }
  },
  
  // Weekly Bonuses Articles
  'What is the Weekly Bonus?': {
    title: 'What is the Weekly Bonus?',
    updated: 'Updated December 2024',
    content: {
      sections: [
        {
          type: 'text',
          content: 'The Weekly Bonus is a recurring reward program that gives eligible players bonuses based on their weekly activity and wagering volume. This bonus is designed to reward consistent players with additional funds or free spins.'
        },
        {
          type: 'heading',
          level: 3,
          content: 'How It Works'
        },
        {
          type: 'list',
          items: [
            'Calculated based on your total weekly wagers',
            'Automatically credited to eligible accounts',
            'Available in multiple reward formats',
            'Refreshes every Monday at 00:00 UTC'
          ]
        },
        {
          type: 'text',
          content: 'Weekly bonuses are typically smaller than monthly bonuses but provide more frequent rewards for active players.'
        }
      ]
    }
  },

  'How do I qualify for the Weekly Bonus?': {
    title: 'How do I qualify for the Weekly Bonus?',
    updated: 'Updated December 2024',
    content: {
      sections: [
        {
          type: 'text',
          content: 'To qualify for the Weekly Bonus, you need to meet certain wagering and activity requirements during the weekly period (Monday to Sunday).'
        },
        {
          type: 'heading',
          level: 3,
          content: 'Qualification Requirements'
        },
        {
          type: 'list',
          items: [
            'Minimum weekly wager of $50 equivalent',
            'Account must be fully verified',
            'No bonus abuse or irregular betting patterns',
            'At least 3 separate gaming sessions during the week'
          ]
        },
        {
          type: 'text',
          content: 'Players who meet these criteria will automatically be considered for the weekly bonus program.'
        }
      ]
    }
  },

  'When is the Weekly Bonus distributed?': {
    title: 'When is the Weekly Bonus distributed?',
    updated: 'Updated December 2024',
    content: {
      sections: [
        {
          type: 'text',
          content: 'Weekly bonuses are distributed every Monday following the completion of the weekly period (Sunday 23:59 UTC).'
        },
        {
          type: 'heading',
          level: 3,
          content: 'Distribution Schedule'
        },
        {
          type: 'list',
          items: [
            'Weekly period: Monday 00:00 UTC to Sunday 23:59 UTC',
            'Processing time: Monday 02:00 - 06:00 UTC',
            'Bonuses credited by: Monday 08:00 UTC',
            'Email notifications sent upon crediting'
          ]
        },
        {
          type: 'text',
          content: 'If you don\'t receive your bonus by Monday evening, please contact our support team for assistance.'
        }
      ]
    }
  },

  'How is the Weekly Bonus amount calculated?': {
    title: 'How is the Weekly Bonus amount calculated?',
    updated: 'Updated December 2024',
    content: {
      sections: [
        {
          type: 'text',
          content: 'The Weekly Bonus amount is calculated based on your total weekly wagering volume and VIP level, with higher activity levels earning larger bonuses.'
        },
        {
          type: 'heading',
          level: 3,
          content: 'Calculation Factors'
        },
        {
          type: 'list',
          items: [
            'Total weekly wager amount',
            'Your current VIP level',
            'Game types played (some games have higher contribution rates)',
            'Consistency of play throughout the week'
          ]
        },
        {
          type: 'heading',
          level: 3,
          content: 'Bonus Ranges'
        },
        {
          type: 'list',
          items: [
            'Bronze Level: 0.1% - 0.3% of weekly wager',
            'Silver Level: 0.2% - 0.5% of weekly wager',
            'Gold Level: 0.3% - 0.7% of weekly wager',
            'Platinum+ Levels: Up to 1.0% of weekly wager'
          ]
        }
      ]
    }
  },

  'What types of Weekly Bonus rewards are available?': {
    title: 'What types of Weekly Bonus rewards are available?',
    updated: 'Updated December 2024',
    content: {
      sections: [
        {
          type: 'text',
          content: 'Weekly bonuses can be awarded in various formats depending on your gaming preferences and recent activity patterns.'
        },
        {
          type: 'heading',
          level: 3,
          content: 'Available Reward Types'
        },
        {
          type: 'list',
          items: [
            'Cash bonuses (most common)',
            'Free spins for slot players',
            'Sports betting free bets',
            'Poker tournament tickets',
            'Casino reload bonuses'
          ]
        },
        {
          type: 'text',
          content: 'The system automatically selects the most appropriate reward type based on your recent gaming activity and preferences.'
        },
        {
          type: 'heading',
          level: 3,
          content: 'Reward Preferences'
        },
        {
          type: 'text',
          content: 'You can set your preferred reward type in your account settings under "Bonus Preferences" to influence which type of weekly bonus you receive.'
        }
      ]
    }
  },

  'Do Weekly Bonuses have wagering requirements?': {
    title: 'Do Weekly Bonuses have wagering requirements?',
    updated: 'Updated December 2024',
    content: {
      sections: [
        {
          type: 'text',
          content: 'Yes, Weekly Bonuses typically come with wagering requirements that must be completed before funds can be withdrawn.'
        },
        {
          type: 'heading',
          level: 3,
          content: 'Standard Wagering Requirements'
        },
        {
          type: 'list',
          items: [
            'Cash bonuses: 25x wagering requirement',
            'Free spins: 40x wagering on winnings',
            'Sports free bets: 1x rollover requirement',
            'Poker tickets: No wagering (tournament entry)'
          ]
        },
        {
          type: 'heading',
          level: 3,
          content: 'Important Terms'
        },
        {
          type: 'list',
          items: [
            'Wagering must be completed within 7 days',
            'Different games contribute differently to wagering',
            'Maximum bet limits apply while bonus is active',
            'Bonus funds expire if wagering isn\'t completed in time'
          ]
        }
      ]
    }
  },

  // Loyalty Program Articles
  'What is the VIP Program?': {
    title: 'What is the VIP Program?',
    updated: 'Updated today',
    content: {
      sections: [
        {
          type: 'text',
          content: 'The VIP Program is our way of rewarding loyal players with exclusive benefits and personalized services. The more you play, the higher your VIP level and the better your rewards.'
        },
        {
          type: 'heading',
          content: 'VIP Program Overview'
        },
        {
          type: 'list',
          items: [
            'Bronze: Entry-level VIP with basic rewards',
            'Silver: Enhanced bonuses and weekly rewards',
            'Gold: Higher bonuses and dedicated support',
            'Platinum: Personalized gifts and exclusive events',
            'Diamond: Top-tier rewards and a personal VIP host'
          ]
        },
        {
          type: 'button',
          text: 'Learn More About VIP',
          action: 'vip-details'
        }
      ]
    }
  },
  
  'How do I join the VIP Program?': {
    title: 'How do I join the VIP Program?',
    updated: 'Updated today',
    content: {
      sections: [
        {
          type: 'text',
          content: 'Joining the VIP Program is easy. All players are automatically enrolled upon reaching the Bronze level. Your VIP level is determined by your total wagering activity.'
        },
        {
          type: 'heading',
          content: 'Joining Requirements'
        },
        {
          type: 'list',
          items: [
            'Bronze: $1,000 total wagered',
            'Silver: $10,000 total wagered',
            'Gold: $50,000 total wagered',
            'Platinum: $250,000 total wagered',
            'Diamond: $1,000,000 total wagered'
          ]
        },
        {
          type: 'button',
          text: 'Check My VIP Status',
          action: 'check-vip-status'
        }
      ]
    }
  },
  
  'VIP Level Benefits and Rewards': {
    title: 'VIP Level Benefits and Rewards',
    updated: 'Updated today',
    content: {
      sections: [
        {
          type: 'text',
          content: 'Each VIP level unlocks a new set of exclusive benefits and rewards designed to enhance your gaming experience.'
        },
        {
          type: 'heading',
          content: 'VIP Rewards by Level'
        },
        {
          type: 'list',
          items: [
            'Bronze: Level-up bonus, weekly cashback',
            'Silver: Increased cashback, dedicated support',
            'Gold: Higher betting limits, personalized gifts',
            'Platinum: VIP host, exclusive event invitations',
            'Diamond: Luxury gifts, custom promotions'
          ]
        },
        {
          type: 'button',
          text: 'View All VIP Benefits',
          action: 'vip-benefits'
        }
      ]
    }
  },
  
  'How to Level Up in VIP Program?': {
    title: 'How to Level Up in VIP Program?',
    updated: 'Updated today',
    content: {
      sections: [
        {
          type: 'text',
          content: 'Leveling up in the VIP Program is based on your total wagering activity. The more you play, the faster you will advance to the next level.'
        },
        {
          type: 'heading',
          content: 'Leveling Up Tips'
        },
        {
          type: 'list',
          items: [
            'Play consistently to accumulate wagering points',
            'Participate in VIP-exclusive tournaments',
            'Take advantage of promotions and bonuses',
            'Higher stakes games contribute more to your progress'
          ]
        },
        {
          type: 'button',
          text: 'Track My VIP Progress',
          action: 'track-vip-progress'
        }
      ]
    }
  },

  'VIP Host Services and Support': {
    title: 'VIP Host Services and Support',
    updated: 'Updated today',
    content: {
      sections: [
        {
          type: 'text',
          content: 'Our VIP hosts provide personalized support and exclusive services to our top-tier players. Your host is your single point of contact for all your gaming needs.'
        },
        {
          type: 'heading',
          content: 'VIP Host Services'
        },
        {
          type: 'list',
          items: [
            '24/7 dedicated support',
            'Custom promotions and bonuses',
            'Faster withdrawal processing',
            'Personalized gifts and rewards',
            'Exclusive event invitations'
          ]
        },
        {
          type: 'button',
          text: 'Contact My VIP Host',
          action: 'contact-vip-host'
        }
      ]
    }
  },

  'VIP Exclusive Events and Tournaments': {
    title: 'VIP Exclusive Events and Tournaments',
    updated: 'Updated today',
    content: {
      sections: [
        {
          type: 'text',
          content: 'As a VIP member, you get exclusive access to high-stakes tournaments and special events with massive prize pools.'
        },
        {
          type: 'heading',
          content: 'Upcoming VIP Events'
        },
        {
          type: 'list',
          items: [
            'Monthly High Roller Tournament - $1M Prize Pool',
            'Weekly VIP Slots Challenge - $100k Prize Pool',
            'VIP Poker Series - Luxury Trip for Winner',
            'Exclusive Live Casino Tables with Higher Limits'
          ]
        },
        {
          type: 'button',
          text: 'View VIP Event Calendar',
          action: 'vip-event-calendar'
        }
      ]
    }
  },

  'How to Join the Affiliate Program?': {
    title: 'How to Join the Affiliate Program?',
    updated: 'Updated today',
    content: {
      sections: [
        {
          type: 'text',
          content: 'Join our affiliate program to earn commission by promoting our platform. It\'s a great way to partner with us and earn passive income.'
        },
        {
          type: 'heading',
          content: 'How to Get Started'
        },
        {
          type: 'list',
          items: [
            'Visit our Affiliate Program page',
            'Complete the registration form',
            'Our team will review your application within 48 hours',
            'Once approved, you\'ll get access to your affiliate dashboard'
          ]
        },
        {
          type: 'button',
          text: 'Join Now',
          action: 'affiliate-join'
        }
      ]
    }
  },

  'Affiliate Commission Structure': {
    title: 'Affiliate Commission Structure',
    updated: 'Updated today',
    content: {
      sections: [
        {
          type: 'text',
          content: 'We offer a competitive commission structure that rewards you for every player you refer. The more players you bring, the more you earn.'
        },
        {
          type: 'heading',
          content: 'Commission Tiers'
        },
        {
          type: 'list',
          items: [
            'Tier 1 (1-10 players): 25% revenue share',
            'Tier 2 (11-50 players): 30% revenue share',
            'Tier 3 (51+ players): 35% revenue share',
            'Custom CPA and hybrid deals available'
          ]
        },
        {
          type: 'button',
          text: 'View Commission Details',
          action: 'commission-details'
        }
      ]
    }
  },

  'Affiliate Marketing Tools and Resources': {
    title: 'Affiliate Marketing Tools and Resources',
    updated: 'Updated today',
    content: {
      sections: [
        {
          type: 'text',
          content: 'We provide a wide range of marketing tools and resources to help you succeed as an affiliate partner.'
        },
        {
          type: 'heading',
          content: 'Available Resources'
        },
        {
          type: 'list',
          items: [
            'Banners and landing pages',
            'Tracking links and analytics',
            'Email templates and social media content',
            'Dedicated affiliate manager support'
          ]
        },
        {
          type: 'button',
          text: 'Access Marketing Tools',
          action: 'marketing-tools'
        }
      ]
    }
  },

  'Affiliate Payment Methods and Schedule': {
    title: 'Affiliate Payment Methods and Schedule',
    updated: 'Updated today',
    content: {
      sections: [
        {
          type: 'text',
          content: 'We offer flexible payment methods and a reliable payment schedule to ensure you get your commissions on time.'
        },
        {
          type: 'heading',
          content: 'Payment Details'
        },
        {
          type: 'list',
          items: [
            'Payments are made monthly, by the 15th of each month',
            'Minimum payout: $100',
            'Available payment methods: Bank Transfer, Skrill, Neteller, Crypto',
            'No negative carryover - start fresh every month'
          ]
        },
        {
          type: 'button',
          text: 'View Payment History',
          action: 'payment-history'
        }
      ]
    }
  },

  // Default article for articles without specific content
  'default': {
    title: 'Help Article',
    updated: 'Updated recently',
    content: {
      sections: [
        {
          type: 'text',
          content: 'This article content is currently being updated. Please contact our live support if you need immediate assistance with this topic.'
        },
        {
          type: 'button',
          text: 'Contact Live Support',
          action: 'contact-support'
        }
      ]
    }
  }
};

// Categories structure
export const categories = [
  { 
    id: 'getting-started',
    name: 'Getting Started', 
    articles: 9,
    type: 'subcategories',
    items: [
      { 
        name: 'Verifying Your Account', 
        articles: 9,
        groups: [
          {
            name: 'Proof of Identity',
            articles: 5,
            items: [
              'Proof of Identity: Acceptable Documentation',
              'Proof of Identity for Nigeria: Acceptable Documentation',
              'Proof of Identity for Japan: Acceptable Documentation',
              'Proof of Identity for India: Acceptable Documentation',
              'Taking a Selfie with an Identity Document: A Step-by-Step Guide'
            ]
          },
          {
            name: 'Proof of Address',
            articles: 2,
            items: [
              'Proof of Address for Japan: Acceptable Documentation',
              'Proof of Address: Acceptable Documentation'
            ]
          },
          {
            name: 'Proof of Source of Funds',
            articles: 2,
            items: [
              'Proof of Source of Funds: Acceptable Documentation',
              'Proof of Source of Funds for Japan: Acceptable Documentation'
            ]
          }
        ]
      }
    ]
  },
  { 
    id: 'account',
    name: 'Account', 
    articles: 10,
    type: 'subcategories',
    items: [
      { 
        name: 'Managing Your Account', 
        articles: 7,
        items: [
          'Can I delete my account?',
          'How to verify your email address?',
          'How to set up your Two-Factor Authentication (2FA) to your account?',
          'Securing your funds: Using the Vault',
          'How to reset your password?',
          'What to do if you have lost access to your email?',
          'What to do if you are unable to access your Two-Factor Authentication (2FA)?'
        ]
      },
      { 
        name: 'Troubleshooting', 
        articles: 4,
        items: [
          'How to clear cache and cookies on your phone?',
          'How to clear cache and cookies on your computer?',
          'How to Report Issues with Third Party Providers?',
          'What to do if a game freezes?'
        ]
      },
      { 
        name: 'Stake Chat', 
        articles: 1,
        items: [
          'How to use the chat feature'
        ]
      }
    ]
  },
  { 
    id: 'stake-smart',
    name: 'Stake Smart', 
    articles: 8,
    type: 'articles',
    items: [
      'Self Exclusion',
      'Gambling Limits',
      'Closing Your Account',
      'Casino Exclusion',
      'Break In Play',
      'Help Organisations & Gambling Blocks',
      'Poker Exclusion',
      'Deposit Limits'
    ]
  },
  { 
    id: 'payments',
    name: 'Payments', 
    articles: 24,
    type: 'subcategories',
    items: [
      { 
        name: 'Local Currency', 
        articles: 9,
        groups: [
          { 
            name: 'Deposits', 
            articles: 5,
            items: [
              'Bank Transfer Deposit: Processing Time and Troubleshooting',
              'Local Currency: Can I Deposit with my Credit Card?',
              '"Payments Temporarily Unavailable" Message. What does it mean?',
              'Canadian Dollars: How to Make a Deposit?',
              'Indian Rupee: How to Make a Deposit?'
            ]
          },
          { 
            name: 'Withdrawals', 
            articles: 4,
            items: [
              'Bank Transfer Withdrawal: Processing Time and Troubleshooting',
              'Indian Rupee: How to Withdraw Funds',
              'Canadian Dollars: Making a Withdrawal via Bank Transfer',
              'Is there a Wager Requirement for Local Currencies?'
            ]
          }
        ]
      },
      { name: 'Crypto', articles: 15 }
    ]
  },
  { 
    id: 'casino',
    name: 'Casino', 
    articles: 22,
    type: 'subcategories',
    items: [
      { 
        name: 'Betting Limits', 
        articles: 3,
        items: [
          'Setting Betting Limits',
          'Understanding Betting Limits for Table Games',
          'How to Adjust Sports Betting Limits'
        ]
      },
      { 
        name: 'Troubleshooting', 
        articles: 2,
        items: [
          'Casino Game Troubleshooting: Common Issues and Solutions',
          'Slot Machine Problems: How to Resolve Technical Issues'
        ]
      },
      { 
        name: 'General Info', 
        articles: 3,
        items: [
          'Which Casino Games save Bonuses and Free Spins?',
          'How do I find my Casino Bet ID?',
          'Provable Fairness for Stake Original Games'
        ]
      },
      { 
        name: 'Poker', 
        articles: 14,
        type: 'subcategories',
        items: [
          { 
            name: 'Tournament Features', 
            articles: 7,
            items: [
              'Tournament Registration and Buy-ins',
              'Tournament Prize Structures',
              'Late Registration Rules',
              'Rebuy and Add-on Options',
              'Tournament Blind Levels',
              'Heads-Up Final Table Rules',
              'Satellite Tournament System'
            ]
          },
          { 
            name: 'Game Types \u0026 Modes', 
            articles: 3,
            items: [
              'Texas Hold\'em Rules and Strategy',
              'Omaha Poker Variations',
              'Sit \u0026 Go Tournament Format'
            ]
          },
          { 
            name: 'Table Features', 
            articles: 4,
            items: [
              'Multi-Table Tournament Features',
              'Cash Game Table Selection',
              'Hand History and Statistics',
              'Table Chat and Player Notes'
            ]
          }
        ]
      }
    ]
  },
  { 
    id: 'sports',
    name: 'Sports', 
    articles: 9,
    type: 'articles',
    items: [
      'What is a Multi Bet?',
      'What is a Same Game Multi?',
      'What is a Single Bet?',
      'How do Asian Totals work?',
      'What does it mean when a bet is voided?',
      'Why is Cashout not available for my bet?',
      'How to find your Sports Bet ID?',
      'What is the 3-Way European Handicap Bet and how does it work?'
    ]
  },
  { 
    id: 'bonuses-promotions',
    name: 'Bonuses & Promotions', 
    articles: 29,
    type: 'subcategories',
    items: [
      { 
        name: 'Monthly Bonuses', 
        articles: 8,
        items: [
          'What is the Monthly Bonus?',
          'How do I become eligible for the Monthly Bonus?',
          'When is the Monthly Bonus sent out?',
          'How is the Monthly Bonus calculated?',
          'How do I get a higher Monthly Bonus next time?',
          'What is the Pre-Monthly and Post-Monthly Bonus?',
          'Which type of rewards can I receive with the Monthly Bonus?',
          'When does the Monthly Bonus expire?'
        ]
      },
      { 
        name: 'Weekly Bonuses', 
        articles: 6,
        items: [
          'What is the Weekly Bonus?',
          'How do I qualify for the Weekly Bonus?',
          'When is the Weekly Bonus distributed?',
          'How is the Weekly Bonus amount calculated?',
          'What types of Weekly Bonus rewards are available?',
          'Do Weekly Bonuses have wagering requirements?'
        ]
      },
{ name: 'Reloads', articles: 3, items: [
        'Reload Bonus Overview',
        'How to Claim a Reload Bonus',
        'Reload Bonus Terms and Conditions'
      ] },
      { name: 'Deposit Bonus Requirements', articles: 2, items: [
        'Eligibility Criteria for Deposit Bonuses',
        'How to Meet Deposit Bonus Requirements'
      ] },
      { name: 'Other Bonuses \u0026 Promotions', articles: 5, items: [
        'Seasonal Promotions',
        'Invite-Only Bonuses',
        'Referral Bonus Details',
        'Cashback Bonus Plans',
        'VIP Bonuses and Perks'
      ] }
    ]
  },
  { 
    id: 'loyalty-programs',
    name: 'Loyalty Programs', 
    articles: 10,
    type: 'subcategories',
    items: [
      { 
        name: 'VIP Program', 
        articles: 6,
        items: [
          'What is the VIP Program?',
          'How do I join the VIP Program?',
          'VIP Level Benefits and Rewards',
          'How to Level Up in VIP Program?',
          'VIP Host Services and Support',
          'VIP Exclusive Events and Tournaments'
        ]
      },
      { 
        name: 'Affiliate Program', 
        articles: 4,
        items: [
          'How to Join the Affiliate Program?',
          'Affiliate Commission Structure',
          'Affiliate Marketing Tools and Resources',
          'Affiliate Payment Methods and Schedule'
        ]
      }
    ]
  }
];
