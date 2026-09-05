export interface TabItem { value: string; label: string; count?: number }
export interface TabsProps {
  items: TabItem[];
  value: string;
  onChange?: (value: string) => void;
  className?: string;
}
export declare function Tabs(props: TabsProps): JSX.Element;
