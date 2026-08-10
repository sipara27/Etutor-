import Navbar from "../navbar/Navbar";

interface HeaderProp {
  className?: string
  title?: string
  activeTab?: string
  underlined?: string
}

function Header({className, title, activeTab, underlined}: HeaderProp) {
  
  return (
    <>
      <div className="relative top-0 left-0 w-full z-50">
        {/* <Advert /> */}
        <Navbar className={className} />
      </div>
    </>
  );
}

export default Header;
