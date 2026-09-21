const fs = require('fs');
let content = fs.readFileSync('src/pages/result-entry/BatchWorkspace.jsx', 'utf8');

const target = `                                        </tr>
                                    );
                                })}
                            </tbody>`;
const replacement = `                                        </tr>
                                    );
                                })
                                )}
                            </tbody>`;

content = content.replace(target, replacement);

fs.writeFileSync('src/pages/result-entry/BatchWorkspace.jsx', content);
console.log("Replaced successfully!");
