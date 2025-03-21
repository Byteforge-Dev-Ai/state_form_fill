export const metadata = {
  title: 'API Documentation - NC Cigar Sales Form Filler',
  description: 'API documentation for the NC Cigar Sales Form Filler application',
};

export default function ApiDocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
} 