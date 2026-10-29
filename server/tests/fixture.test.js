describe('Tournament Fixture Scheduling Unit Tests', () => {
  const generateKnockoutPairs = (teams) => {
    const pairs = [];
    for (let i = 0; i < teams.length; i += 2) {
      pairs.push([teams[i], teams[i + 1] || 'BYE']);
    }
    return pairs;
  };

  test('should generate correct pairing for 4 teams in knockout', () => {
    const teams = ['Team A', 'Team B', 'Team C', 'Team D'];
    const pairs = generateKnockoutPairs(teams);
    expect(pairs.length).toBe(2);
    expect(pairs[0]).toEqual(['Team A', 'Team B']);
    expect(pairs[1]).toEqual(['Team C', 'Team D']);
  });

  test('should assign BYE when team count is odd', () => {
    const teams = ['Team A', 'Team B', 'Team C'];
    const pairs = generateKnockoutPairs(teams);
    expect(pairs.length).toBe(2);
    expect(pairs[1]).toEqual(['Team C', 'BYE']);
  });
});
