module.exports = {
    name: "Account Exec", // The name of the actor role
    shortname: 'accountexec',
    description: "The Account Executive works with customers to map their digital transformation journey, highlighting their current, next, and future states via Mapping to GEAR.",
    permissions: [
        "view_mapping", // Permission to view the Mapping to GEAR visualization
        "edit_mapping", // Permission to modify the Mapping to GEAR for a customer
        "identify_customer_states", // Permission to define the current, next, and future states of customers
        "create_roadmap", // Permission to build and update roadmaps for customers
        "customize_customer_journey", // Permission to personalize journey steps and milestones
    ],
    dashboard: {
        widgets: [
            {
                name: "MappingToGEAR", // A widget to visualize and interact with the Mapping to GEAR
                description: "View and customize the digital transformation map for customers.",
                settings: {
                    defaultView: "customer_map", // Default view mode could be customer's transformation map
                },
            },
            {
                name: "CustomerPhaseTracker", // A widget for marking current, next, and future states
                description: "Identify the customer’s current state, next state, and future state for their journey.",
                settings: {
                    showPreviousPhases: true, // Option to display previous state history
                },
            },
            {
                name: "RoadmapBuilder", // A widget to create customer roadmaps
                description: "Create and maintain custom roadmaps for customers’ digital transformation.",
                settings: {
                    allowMilestoneEdit: true, // Option to edit milestones in the roadmap
                },
            },
        ],
    },
    allowedUseCases: [
        "ViewMapping", // Use case to view the Mapping to GEAR
        "EditMapping", // Use case to modify the mapping and save changes
        "DefinePhases", // Use case to set the customer's current, next, and future states
        "BuildRoadmap", // Use case to create digital transformation roadmaps
    ],
    scenarios: [
        "MappingCreationScenario", // A scenario where the Account Exec designs a new map
        "InteractiveRoadmapReview", // A collaborative scenario with the customer to review the progress
    ],
};
