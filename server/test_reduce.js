const plan = {
    exercises: [
        {
            "name": "Mon: Jumping Jacks",
            "sets": 3,
            "reps": 12,
            "rest": "60s",
            "gifUrl": "https://i.pinimg.com/originals/db/7f/05/db7f05c4b8e23faba69ca4837dc87a71.gif",
            "_id": "69a42bf9b75cc7513dea2bfc"
        }
    ]
};

const grouped = plan.exercises?.reduce((acc, ex) => {
    let day = 'Exercises';
    let name = ex.name;
    const match = name.match(/^(Mon|Tue|Wed|Thu|Fri|Sat|Sun):\s*(.*)/);
    if (match) {
        const dayMap = { Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday', Fri: 'Friday', Sat: 'Saturday', Sun: 'Sunday' };
        day = dayMap[match[1]] || match[1] + 'day';
        name = match[2];
    } else if (name.match(/^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\s*(.*)/)) {
        const match2 = name.match(/^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\s*(.*)/);
        day = match2[1];
        name = match2[2];
    }
    if (!acc[day]) acc[day] = [];
    acc[day].push({ ...ex, name });
    return acc;
}, {});

console.dir(grouped, { depth: null });
