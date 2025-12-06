import React from 'react';
import PrimaryButton from './PrimaryButton';
import SecondaryButton from './SecondaryButton';
import IconButton from './IconButton';

const Button = ({ variant = 'primary', ...props }) => {
  if (variant === 'secondary') return <SecondaryButton {...props} />;
  if (variant === 'icon') return <IconButton {...props} />;
  return <PrimaryButton {...props} />;
};

export default Button;
