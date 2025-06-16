
"use client";

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Mail, Phone, MapPin } from 'lucide-react';

interface KnowMoreModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KnowMoreModal({ isOpen, onClose }: KnowMoreModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px] bg-card rounded-lg shadow-xl">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl text-primary">Contact Us</DialogTitle>
          <DialogDescription className="font-body text-muted-foreground">
            We'd love to hear from you. Here's how you can reach us.
          </DialogDescription>
        </DialogHeader>
        <div className="py-6 space-y-6 font-body">
          <div className="flex items-start space-x-3">
            <MapPin className="h-6 w-6 text-primary mt-1 shrink-0" />
            <div>
              <h4 className="font-semibold text-foreground">Address</h4>
              <p className="text-muted-foreground">123 Style Avenue, Fashion City, FC 54321</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <Mail className="h-6 w-6 text-primary mt-1 shrink-0" />
            <div>
              <h4 className="font-semibold text-foreground">Email</h4>
              <p className="text-muted-foreground">
                <a href="mailto:hello@lookbook.com" className="hover:text-primary transition-colors">
                  hello@lookbook.com
                </a>
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <Phone className="h-6 w-6 text-primary mt-1 shrink-0" />
            <div>
              <h4 className="font-semibold text-foreground">Phone</h4>
              <p className="text-muted-foreground">
                <a href="tel:+1234567890" className="hover:text-primary transition-colors">
                  +1 (234) 567-890
                </a>
              </p>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onClose} variant="outline">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
