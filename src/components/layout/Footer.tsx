export function Footer() {
  return (
    <footer className="border-t border-border/40 mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-sm text-muted-foreground font-body">
        <p>&copy; {new Date().getFullYear()} Lookbook App. All rights reserved.</p>
        <p>Designed with elegance and sophistication.</p>
      </div>
    </footer>
  );
}
