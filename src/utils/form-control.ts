import { FormControlProps } from "react-bootstrap/FormControl";

export function handleForEventValue(f: (arg: string) => void) {
  return (event: React.SyntheticEvent<FormControlProps>) => {
    f((event.target as HTMLInputElement).value);
  }
};
