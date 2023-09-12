export interface LLDataChanges{
    livingLabId: boolean,
    name: boolean,
    focalQuestion: boolean,
    description: boolean,
    logo: boolean,
    locationState: boolean,

    selectedDTs: boolean,
    selectedSDGs: boolean,
    selectedTax: boolean,
    selectedExistingStakeholders: boolean,
    newlyCreatedStakeholders: boolean,
    entities: boolean,
    connections: boolean,
    activities: boolean,
    activityIdsToBeDeleted: boolean,
    isPublic: boolean,
    isPublished: boolean,
    outcomes: boolean,
    selectedSDGImpact: boolean
}
