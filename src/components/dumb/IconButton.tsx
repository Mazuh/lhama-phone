import React from 'react';
import Button, { ButtonProps } from 'react-bootstrap/Button';
import MaterialIcon from '@material/react-material-icon';

const fixedClass = 'icon-button';

interface IconButtonProps extends ButtonProps, React.HTMLAttributes<HTMLButtonElement> {
  icon: string;
  className?: string;
}

const IconButton: React.FC<IconButtonProps> = ({ icon, className, ...buttonProps }) => {
  return (
    <Button className={className ? `${fixedClass} ${className}` : fixedClass} {...buttonProps}>
      <MaterialIcon icon={icon} />
    </Button>
  );
};

export default IconButton;
