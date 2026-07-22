import { cn } from "@avplatform/ui/lib";

interface RightContainerProps {
  heading: string;
  subHeading: string;
  imgSrc: string;
  className?: string;
}

/**
 * RightContainer component renders a container with a heading, subheading, and an image.
 * It is designed to be displayed on larger screens (lg and above).
 *
 * @param {RightContainerProps} props - The properties for the RightContainer component.
 * @param {string} props.heading - The main heading text to be displayed.
 * @param {string} props.subHeading - The subheading text to be displayed.
 * @param {string} props.imgSrc - The source URL of the image to be displayed.
 *
 * @returns {JSX.Element} The rendered RightContainer component.
 */
const RightContainer = ({
  heading,
  subHeading,
  imgSrc,
  className = "lg:w-[50%]",
}: RightContainerProps) => {
  return (
    <div
      className={cn(
        "relative hidden overflow-hidden rounded-[1.5rem] bg-slate-100 lg:block lg:w-[50%]",
        className,
      )}
    >
      <div className="absolute w-full">
        <div className="mt-0 flex flex-col gap-3 px-[5.5rem] py-16">
          <h2 className="text-5xl font-medium leading-[3.5rem] text-secondary">{heading}</h2>
          <p className="text-muted-foreground">{subHeading}</p>
        </div>
        <div className="-mt-6 ml-[5rem] overflow-hidden rounded-[1rem] border-[0.35rem] border-white shadow lg:w-[60vw] xl:w-[70vw]">
          <img className="rounded-[1rem] object-cover" src={imgSrc} alt="Image" />
        </div>
      </div>
    </div>
  );
};

export { RightContainer };
