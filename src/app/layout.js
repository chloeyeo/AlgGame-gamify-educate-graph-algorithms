import "./globals.css";

export const metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="sm:bg-gray-50 w-full min-h-screen flex justify-center items-center">
          <div className="bg-white w-full h-full sm:w-[576px] sm:h-screen relative flex flex-col overflow-hidden sm:shadow-lg">
            <div className="flex-grow overflow-hidden">
              <div className="h-full overflow-y-auto bg-white px-4 sm:px-6 py-0 no-scrollbar">
                {children}
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
