import classNames from "classnames";

interface IInputProps extends React.HTMLProps<HTMLInputElement> {
  id: string;
  label: string;
}

const Input: React.FC<IInputProps> = ({
  type = "text",
  id,
  label,
  className,
  ...rest
}) => {
  return (
    <div className="form-control w-full max-w-xs">
      <label className="label text-xs pb-1" htmlFor={id}>
        {label}
      </label>
      <input
        type={type}
        id={id}
        {...rest}
        className={classNames({
          "range range-sm": type === "range",
          "input input-bordered w-full max-w-xs input-sm": type === "text",
        }, className)}
      />
    </div>
  );
};

export default Input;
