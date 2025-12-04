type ParameterRowProps = {
  name: string;
  type: string;
  description: string;
};

export function ParameterRow({
  name,
  type,
  description,
}: ParameterRowProps): React.ReactNode {
  return (
    <>
      <span className={"text-sm leading-inherit font-mono text-primary"}>
        {name}
      </span>
      <span className={"text-secondary"}> — {description}</span>
      <br />
      <p className={"text-xs font-mono text-secondary/60 my-0.5"}>{type}</p>
    </>
  );
}
