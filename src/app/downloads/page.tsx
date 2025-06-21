
"use client";

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import type { SharedFile } from '@/lib/types';
import { Loader2, FileText, Download, AlertCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';

export default function DownloadsPage() {
  const searchParams = useSearchParams();
  const [files, setFiles] = useState<SharedFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);

  useEffect(() => {
    const phoneFromUrl = searchParams.get('phone');
    const guestPhoneNumber = localStorage.getItem('guestPhoneNumber');

    let effectivePhoneNumber: string | null = null;
    
    if (phoneFromUrl) {
      effectivePhoneNumber = phoneFromUrl;
      localStorage.setItem('guestPhoneNumber', phoneFromUrl); // Save/update for future visits
    } else if (guestPhoneNumber) {
      effectivePhoneNumber = guestPhoneNumber;
    }

    if (effectivePhoneNumber) {
      setPhoneNumber(effectivePhoneNumber);
      fetchFiles(effectivePhoneNumber);
    } else {
      setError("No phone number found. Please use the link from your notification or log in as a guest again.");
      setIsLoading(false);
    }
  }, [searchParams]);

  const fetchFiles = async (phone: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const filesCollectionRef = collection(db, "sharedFiles");
      const q = query(filesCollectionRef, where("phoneNumber", "==", phone));
      const querySnapshot = await getDocs(q);
      
      const fetchedFiles: SharedFile[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        let uploadedAtDisplay = 'N/A';
        if (data.uploadedAt && data.uploadedAt.toDate) {
             uploadedAtDisplay = data.uploadedAt.toDate().toLocaleDateString();
        } else if (data.uploadedAt) {
            uploadedAtDisplay = new Date(data.uploadedAt).toLocaleDateString();
        }

        fetchedFiles.push({
          id: doc.id,
          ...data,
          uploadedAt: uploadedAtDisplay,
        } as SharedFile);
      });
      setFiles(fetchedFiles.sort((a,b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()));
    } catch (e: any) {
      console.error("Error fetching files:", e);
      setError(`Failed to fetch files. ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="max-w-3xl mx-auto shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-headline text-primary">Your Shared Files</CardTitle>
            {phoneNumber && <CardDescription className="font-body">Files shared with phone number: {phoneNumber}</CardDescription>}
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="ml-4 text-lg font-body text-muted-foreground">Loading files...</p>
              </div>
            ) : error ? (
              <div className="text-center py-10 bg-destructive/10 p-6 rounded-md">
                <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                <p className="text-xl font-semibold text-destructive mb-2">Access Error</p>
                <p className="text-muted-foreground font-body mb-6">{error}</p>
                <Button asChild>
                  <Link href="/">Go to Homepage</Link>
                </Button>
              </div>
            ) : files.length === 0 ? (
              <div className="text-center py-10 bg-secondary/30 p-6 rounded-md">
                <Info className="h-12 w-12 text-primary mx-auto mb-4" />
                <p className="text-xl font-semibold text-primary mb-2">No Files Found</p>
                <p className="text-muted-foreground font-body mb-6">
                  There are no files currently shared with this phone number.
                  If you believe this is an error, please contact support or the administrator.
                </p>
                 <Button asChild variant="outline">
                  <Link href="/">Back to Homepage</Link>
                </Button>
              </div>
            ) : (
              <ul className="space-y-4">
                {files.map((file) => (
                  <li key={file.id} className="p-4 border rounded-lg bg-card hover:shadow-md transition-shadow flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-3 flex-grow">
                      <FileText className="h-8 w-8 text-primary shrink-0" />
                      <div>
                        <p className="font-semibold font-body text-lg text-foreground truncate max-w-xs sm:max-w-md" title={file.originalFileName}>
                          {file.originalFileName}
                        </p>
                        <p className="text-xs text-muted-foreground font-body">
                          Type: {file.fileType} | Uploaded: {file.uploadedAt?.toString()}
                        </p>
                      </div>
                    </div>
                    <Button asChild variant="default" size="sm" className="mt-2 sm:mt-0 w-full sm:w-auto shrink-0">
                      <a href={file.downloadURL} target="_blank" rel="noopener noreferrer" download={file.originalFileName}>
                        <Download className="mr-2 h-4 w-4" /> Download
                      </a>
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
