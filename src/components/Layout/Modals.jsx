import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext'; // Import AuthContext
import WalletModal from '../Modals/WalletModal'; // Import the WalletModal component
import { useSearchParams } from 'react-router';
import { toast } from 'sonner'; // Import toast from sonner
import Statistics from '../Modals/Statistics';
import VerificationModal from '../Modals/VerificationModal';
import TwoStepRegistrationModal from '../Modals/TwoStepRegistrationModal';

export default function Modals() {
    const { user, verifyCode, resendVerificationCode, updateUserDetails } = useContext(AuthContext);
    const [searchParams, setSearchParams] = useSearchParams();
    const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
    const [isTwoStepModalOpen, setIsTwoStepModalOpen] = useState(false);

    useEffect(() => {
        // Check if the user's email is verified or if additional details are required
        // if (user) {
        //     if (!user.is_verified) {
        //         setIsVerificationModalOpen(true);
        //     } else if (!user.firstName || !user.lastName || !user.country) {
        //         setIsTwoStepModalOpen(true);
        //     }
        // }
    }, [user]);

    const handleVerify = async (verificationCode) => {
        try {
            const isVerified = await verifyCode(verificationCode); // Call the verifyCode function from AuthContext
            if (isVerified) {
                setIsVerificationModalOpen(false); // Close the modal if verification is successful
                if (!user.firstName || !user.lastName || !user.country) {
                    setIsTwoStepModalOpen(true); // Open the two-step registration modal if details are missing
                }
            } else {
                toast.error('Invalid verification code.');
            }
        } catch (error) {
            console.error('Verification error:', error);
            toast.error('An error occurred during verification. Please try again.');
        }
    };

    const handleResendCode = async () => {
        try {
            await resendVerificationCode(user.email); // Call the resend function
            toast.success('A new verification code has been sent to your email.');
        } catch (error) {
            console.error('Resend code error:', error);
            toast.error('Failed to resend verification code. Please try again.');
        }
    };

    const handleSubmitDetails = async (details) => {
        try {
            await updateUserDetails(details); // Call the API to update user details
            setIsTwoStepModalOpen(false); // Close the modal after successful update
        } catch (error) {
            console.error('Error updating user details:', error);
            toast.error('Failed to update details. Please try again.');
        }
    };

    return (
        <>
            <WalletModal
                isOpen={searchParams.get('modal') === 'wallet'} // Open modal if modal=wallet
                onClose={() => {
                    searchParams.delete('modal'); // Remove modal query parameter
                    searchParams.delete('tab'); // Remove tab query parameter
                    setSearchParams(searchParams); // Update the URL
                }}
            />
            <Statistics isOpen={searchParams.get('modal') === 'user'} />
            {/* <VerificationModal
            isOpen={isVerificationModalOpen}
            onClose={() => setIsVerificationModalOpen(false)}
            onVerify={handleVerify}
            onResendCode={handleResendCode}
        /> */}
            <TwoStepRegistrationModal
                isOpen={isTwoStepModalOpen}
                onClose={() => setIsTwoStepModalOpen(false)}
                onSubmit={handleSubmitDetails}
            />
        </>
    )
}
