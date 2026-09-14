import "./globals.css";
export const metadata = {
  title: "EPL | ESDM Premier League",
  description: "University cricket tournament of the ESDM Department.",
};
const RootLayout = ({ children }) => {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
};

export default RootLayout;
