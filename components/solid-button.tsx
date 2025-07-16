import React from "react";

/**
 * A plain button component that replicates the sophisticated multi-layer "solid" button style.
 * This example uses the 'indigo' color scheme from the original code.
 */
export function SolidButton({ children, ...props }) {
  const buttonClasses = `
   /* --- Base Styles --- */
   relative isolate inline-flex items-center justify-center rounded-[8px] border font-semibold
   px-3.5 py-2.5 text-base sm:px-3 sm:py-1.5 sm:text-sm
   focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500
  
   /* --- Color: Indigo --- */
   text-white
  
   /* --- The 3-Layer Solid Effect --- */
  
   /* Layer 1: The <button> element itself, acting as the border. */
   /* Its background is the border color. */
   border-transparent bg-indigo-600/90
  
   /* Layer 2: The ::before pseudo-element for the main background and shadow. */
   /* It's positioned absolutely inside the button, inset by 1px (via the smaller border-radius). */
   before:absolute before:inset-0 before:-z-10 before:rounded-[7px] before:bg-indigo-500 before:shadow-sm
  
   /* Layer 3: The ::after pseudo-element for the inner highlight and hover overlay. */
   /* It's also inset by 1px. */
   after:absolute after:inset-0 after:-z-10 after:rounded-[7px]
  
   /* The subtle inner highlight shadow to give a "glossy" look. */
   after:shadow-[inset_0_1px_rgba(255,255,255,0.15)]
  
   /* On hover, the ::after element gets a semi-transparent white background. */
   hover:after:bg-white/10
 `;

  return (
    <button className={buttonClasses} {...props}>
      {children}
    </button>
  );
}
