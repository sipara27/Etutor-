import React, { ReactNode, useEffect, useRef } from "react";
import Carousel, { CarouselProps, ResponsiveType } from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import './index.css'

interface TextCarouselProps extends Partial<CarouselProps>{
  children:ReactNode
  slide: number
}

export const responsive: ResponsiveType = {
  // Define responsive settings for different screen sizes
  xxl: {
    breakpoint: {min: 1280, max: 3000},
    items: 5,
    // slidesToSlide: 5
  },
  xl: {
    breakpoint: { max: 1280, min: 1024 },
    items: 4,
    // slidesToSlide: 4,
  },
  lg: {
    breakpoint: { max: 1024, min: 768 },
    items: 3,
    // slidesToSlide: 3,
  },
  md: {
    breakpoint: {min: 640, max: 768},
    items: 2,
    // slidesToSlide: 2
  },
  sm: {
    breakpoint: { max: 640, min: 0 },
    items: 1,
    // slidesToSlide: 1,
  },
};

const TextCarousel = ({children, slide, ...props}: TextCarouselProps) => {
  const ref = useRef<Carousel>(null)

  useEffect(() => {
    if(ref.current){
    ref.current.goToSlide(slide, true)
    ref.current.setState({current_slide: slide - 5})
    }
  }, [slide])

  return (
    children && <Carousel ref={ref}  {...props} responsive={responsive}>{children}</Carousel>
  );
};

export default TextCarousel;
