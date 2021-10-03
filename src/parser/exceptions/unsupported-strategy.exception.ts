export class UnsupportedStrategyException extends Error {
  constructor(strategyName: string) {
    super(`Strategy "${strategyName}" not supported.`);
  }
}
