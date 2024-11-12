// Icons
import { MdAccountCircle } from "react-icons/md";

// Interfaces
interface HeaderProps {
  label: string;
  text: string;
}

export const Header = ({ label, text }: HeaderProps) => {
  return (
    <header className="flex w-full flex-col items-center justify-center gap-y-2">
      <div className="flex items-center justify-center">
        <MdAccountCircle className="h-8 w-8" />
        <h1 className="text-3xl font-semibold">{text}</h1>
      </div>
      <p className="font-muted-foreground text-sm">{label}</p>
    </header>
  );
};
