const ensureNecessaryEnvs = (mandatoryEnvs: string[]): void => {
  // Ensure required ENV vars are set
  let missingEnvs = mandatoryEnvs.filter(
    (env) => !(typeof process.env[env] !== 'undefined')
  );

  if (missingEnvs.length === 0) {
    return;
  }
  throw new Error(
    'Required ENV variables are not set: ' + missingEnvs.join(', ') + ''
  );
};

const randomInt = (
  low: number = 0,
  high: number = Number.MAX_SAFE_INTEGER
): number => {
  return Math.floor(Math.random() * (high - low) + low);
};

const getOrThrow = <T>(prop: string, obj: { [key: string]: any }) => {
  if (prop in obj) return obj[prop] as T;
  throw new Error(`property ${prop} does not exist in the object`);
};

function getDefinedOrThrow<T>(entity: T | undefined): T {
    if (entity === undefined) {
      throw new Error('Entity should be defined');
    }
    return entity;
}

function appendOrCreate<T>(arr: T[] | undefined, entity: T): T[] {
  return arr ? [...arr, entity] : [entity];
}

function deleteOrEmpty<T>(arr: T[] | undefined, entity: T): T[] {
  return arr ? arr.filter(t => t !== entity) : [];
}

function isDefined<T>(item: T | undefined): item is T {
  return item !== undefined;
}

function isBetween(value: Date, after: Date, before: Date): boolean {
  return after.getTime() <= value.getTime() && value.getTime() <= before.getTime();
}

function dateComparator(a: Date, b: Date) {
  return a.getTime() - b.getTime();
}

export {
  ensureNecessaryEnvs,
  randomInt,
  getOrThrow,
  getDefinedOrThrow,
  appendOrCreate,
  deleteOrEmpty,
  isDefined,
  isBetween,
  dateComparator,
};
