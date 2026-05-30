declare module 'react-icons/fa' {
  import { IconType } from 'react-icons';
  export const FaFacebook: IconType;
  export const FaTwitter: IconType;
  export const FaInstagram: IconType;
  export const FaLinkedin: IconType;
}

declare module 'react-icons' {
  import { ComponentType, SVGAttributes } from 'react';
  export type IconType = ComponentType<SVGAttributes<SVGElement>>;
}
