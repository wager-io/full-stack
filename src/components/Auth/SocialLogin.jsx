function SocialLogin() {
  return (
    <div className="mt-6 pt-6 border-t border-gray-700">
      <p className="text-center text-gray-300 mb-4">Or login with</p>
      <div className="flex items-center justify-center space-x-4">
        {/* Facebook */}
        <button className="p-3 bg-[#2f4553] rounded-[6px] hover:bg-[#3a5060] transition-colors shadow-[0_4px_6px_rgba(0,0,0,0.3)] cursor-pointer">
          <svg
            className="w-6 h-6"
            fill="#1877F2"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {/* Google */}
        <button className="p-3 bg-[#2f4553] rounded-[6px] hover:bg-[#3a5060] transition-colors shadow-[0_4px_6px_rgba(0,0,0,0.3)] cursor-pointer">
          <svg
            className="w-6 h-6"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              fill="#EA4335"
              d="M5.26620003,9.76452941 C6.19878754,6.93863203 8.85444915,4.90909091 12,4.90909091 C13.6909091,4.90909091 15.2181818,5.50909091 16.4181818,6.49090909 L19.9090909,3 C17.7818182,1.14545455 15.0545455,0 12,0 C7.27006974,0 3.1977497,2.69829785 1.23999023,6.65002441 L5.26620003,9.76452941 Z"
            />
            <path
              fill="#34A853"
              d="M16.0407269,18.0125889 C14.9509167,18.7163016 13.5660892,19.0909091 12,19.0909091 C8.86648613,19.0909091 6.21911939,17.076871 5.27698177,14.2678769 L1.23746264,17.3349879 C3.19279051,21.2936293 7.26500293,24 12,24 C14.9328362,24 17.7353462,22.9573905 19.834192,20.9995801 L16.0407269,18.0125889 Z"
            />
            <path
              fill="#4A90E2"
              d="M19.834192,20.9995801 C22.0291676,18.9520994 23.4545455,15.903663 23.4545455,12 C23.4545455,11.2909091 23.3454545,10.5272727 23.1818182,9.81818182 L12,9.81818182 L12,14.4545455 L18.4363636,14.4545455 C18.1187732,16.013626 17.2662994,17.2212117 16.0407269,18.0125889 L19.834192,20.9995801 Z"
            />
            <path
              fill="#FBBC05"
              d="M5.27698177,14.2678769 C5.03832634,13.556323 4.90909091,12.7937589 4.90909091,12 C4.90909091,11.2182781 5.03443647,10.4668121 5.26620003,9.76452941 L1.23999023,6.65002441 C0.43658717,8.26043162 0,10.0753848 0,12 C0,13.9195484 0.444780743,15.7301709 1.23746264,17.3349879 L5.27698177,14.2678769 Z"
            />
          </svg>
        </button>

        {/* Twitch */}
        <button className="p-3 bg-[#2f4553] rounded-[6px] hover:bg-[#3a5060] transition-colors shadow-[0_4px_6px_rgba(0,0,0,0.3)] cursor-pointer">
          <svg
            className="w-6 h-6"
            fill="#9146FF"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M21 0H3a2 2 0 00-2 2v16.5a2 2 0 002 2h4.5V24l3.5-3.5h4.5L21 18V2a2 2 0 00-2-2zm-2 15.5h-3.5L12 19v-3.5H7V3h12v12.5z" />
            <path d="M14 7h-2v5h2V7zm-4 0H8v5h2V7z" />
          </svg>
        </button>

        {/* LINE */}
        <button className="p-3 bg-[#2f4553] rounded-[6px] hover:bg-[#3a5060] transition-colors shadow-[0_4px_6px_rgba(0,0,0,0.3)] cursor-pointer">
          <svg
            className="w-6 h-6"
            fill="#00C300"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M12 2C6.477 2 2 6.026 2 10.98c0 3.89 2.93 7.21 6.97 8.22.27.06.63.18.72.42.08.24.05.61.03.85l-.11.66c-.03.24-.19.94.82.51 1-.43 5.4-3.18 7.38-5.45C20.4 13.9 22 12.07 22 10.98 22 6.026 17.523 2 12 2zm-1.5 11.5h-2v-5h2v5zm3.5 0h-2v-5h2v5zm3.5 0h-2v-5h2v5z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default SocialLogin;