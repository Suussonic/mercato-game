// Dragon Ball API types
export interface DragonBallPlanet {
  id: number;
  name: string;
  isDestroyed: boolean;
  description: string;
  image: string;
  deletedAt: string | null;
}

export interface DragonBallTransformation {
  id: number;
  name: string;
  image: string;
  ki: string;
  deletedAt: string | null;
}

export interface DragonBallCharacter {
  id: number;
  name: string;
  ki: string;
  maxKi: string;
  race: string;
  gender: string;
  description: string;
  image: string;
  affiliation: string;
  deletedAt: string | null;
  originPlanet?: DragonBallPlanet;
  transformations: DragonBallTransformation[];
}

export interface DragonBallAPIResponse {
  items: DragonBallCharacter[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
  links: {
    first: string;
    previous: string;
    next: string;
    last: string;
  };
}
