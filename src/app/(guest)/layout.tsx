import Footer from "@/components/footer";
import Navbar from "@/components/navbar";

const GuestLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <Navbar />
      <div className="container mx-auto pt-14">{children}</div>
      <Footer />
    </div>
  );
};

export default GuestLayout;
