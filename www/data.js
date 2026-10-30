// © Isaac CINZA — données des programmes.
//
// Organisation à trois niveaux :
//   Établissement (Université / Institut supérieur)
//     -> Faculté (ou Département / Section pour un institut)
//          -> Promotion -> Semestres -> UE -> cours ["Intitulé", crédits]
//
// Pour ajouter une FACULTÉ : copier un bloc { nom: "...", promotions: [...] } dans "facultes".
// Pour activer les INSTITUTS SUPÉRIEURS : retirer « bientot: true », renseigner « regles »
// et ajouter les départements / sections dans « facultes ».
window.DATA = [
  {
    nom: "Université",
    niveau: "Faculté",
    // Règles de délibération communes à toutes les universités (à ajuster ici, une seule fois) :
    //   seuilUE     : moyenne minimale pour valider une UE
    //   seuilAnnee  : moyenne annuelle minimale pour être admis
    //   partielMin  : pourcentage minimal de crédits validés pour la validation partielle (VP)
    //   mentionVT   : true = la mention n'est accordée qu'en validation totale
    //   mentions / lettres : [seuil, libellé], du plus haut au plus bas
    regles: {"seuilUE": 10, "seuilAnnee": 10, "partielMin": 70, "mentionVT": true, "mentions": [[16, "Très Bien"], [14, "Bien"], [12, "Assez Bien"], [10, "Passable"]], "lettres": [[18, "A"], [16, "B"], [14, "C"], [12, "D"], [10, "E"], [0, "F"]]},
    facultes: [
      {
        nom: "Faculté de Médecine",
        promotions: [
          {
            nom: "Bac 1 (Premier baccalauréat)",
            semestres: [
              {
                nom: "Semestre 1",
                ues: [
                  {
                    nom: "UE non précisées",
                    cours: [
                      ["Anatomie 1 : Ostéologie, arthrologie, Myologie, Angiologie, Anatomie maxillo-faciale",8],
                      ["Santé publique : Santé communautaire",2],
                      ["Vaccinologie 1",1],
                      ["Bases physiques préparant aux Sciences biomédicales",3],
                      ["Bases de Biologie préparant aux Sciences biomédicales",5],
                      ["Séminaire d’analyse des pratiques professionnelles 1",2],
                      ["Biostatistiques",4],
                      ["Informatique et Recherche documentaire",3],
                      ["Éducation à la citoyenneté",1],
                      ["Histoire de la Médecine",1]
                    ]
                  }
                ]
              },
              {
                nom: "Semestre 2",
                ues: [
                  {
                    nom: "UE non précisées",
                    cours: [
                      ["Bases de Chimie préparatoires aux Sciences biomédicales",5],
                      ["Biophysique",4],
                      ["Histologie 1",5],
                      ["Anglais médical 1",3],
                      ["Bases mathématiques préparant aux Sciences biomédicales",3],
                      ["Situation d’intégration 1",2],
                      ["Premiers secours",2],
                      ["Stage de soins communautaires",6]
                    ]
                  }
                ]
              }
            ]
          },
          {
            nom: "Bac 2 (Deuxième baccalauréat)",
            semestres: [
              {
                nom: "Semestre 3",
                ues: [
                  {
                    nom: "UE non précisées",
                    cours: [
                      ["Entomologie",2],
                      ["Anatomie 2 : Splanchnologie, Neuroanatomie, Anatomie thoracique",9],
                      ["Histologie 2",5],
                      ["Biochimie",6],
                      ["Biologie moléculaire et Génétique 1",5],
                      ["Soins infirmiers",2],
                      ["Vaccinologie 2",1]
                    ]
                  }
                ]
              },
              {
                nom: "Semestre 4",
                ues: [
                  {
                    nom: "UE non précisées",
                    cours: [
                      ["Physiologie générale",5],
                      ["Embryologie",4],
                      ["Santé publique : Hygiène",3],
                      ["Génétique 2",3],
                      ["Séminaire d’analyse des pratiques professionnelles 2",3],
                      ["Méthodologie de la recherche 1",4],
                      ["Anglais médical 2",2],
                      ["Situation d’intégration 2",2],
                      ["Stage de soins infirmiers",3],
                      ["Communication pour le changement social et de comportement en santé 1",1]
                    ]
                  }
                ]
              }
            ]
          },
          {
            nom: "Bac 3 (Troisième baccalauréat, L3)",
            semestres: [
              {
                nom: "Semestre 5",
                ues: [
                  {
                    nom: "UE1 CSS",
                    cours: [
                      ["Sémiologie médicale",4],
                      ["Physiologie spéciale (moyenne des sous-matières)",8],
                      ["Anatomie pathologique générale",4],
                      ["Neurophysiologie",1],
                      ["Pharmacologie générale",3]
                    ]
                  },
                  {
                    nom: "UE4 PDS",
                    cours: [
                      ["Parasitologie",4],
                      ["Microbiologie",6]
                    ]
                  }
                ]
              },
              {
                nom: "Semestre 6",
                ues: [
                  {
                    nom: "UE1 CSS",
                    cours: [
                      ["Biologie clinique",4],
                      ["Immunologie et Vaccinologie 3",2],
                      ["Sémiologie chirurgicale",4],
                      ["Radio-anatomie",3],
                      ["Chirurgie générale",2],
                      ["Oncologie clinique",2],
                      ["Physiopathologie",4],
                      ["Séminaire d’analyse des pratiques professionnelles 3",2],
                      ["Situation d’intégration 3",1]
                    ]
                  },
                  {
                    nom: "UE4 PDS",
                    cours: [
                      ["Stage de laboratoire",2],
                      ["Stage de sémiologie",2]
                    ]
                  },
                  {
                    nom: "UE3 RCH",
                    cours: [
                      ["TFC",2]
                    ]
                  }
                ]
              }
            ]
          },
          {
            nom: "Master 1 (Premier master)",
            semestres: [
              {
                nom: "Semestre 7",
                ues: [
                  {
                    nom: "UE4 PDS",
                    cours: [
                      ["Pharmacologie spéciale",4],
                      ["Santé publique : Épidémiologie",3],
                      ["Pneumologie",2],
                      ["Hématologie",2],
                      ["Cardiologie",2],
                      ["Néphrologie",2],
                      ["Gastro-entérologie",2],
                      ["Obstétrique",7],
                      ["Anatomie pathologique spéciale 1",2],
                      ["Situation d’intégration 4",2],
                      ["Stage clinique d’obstétrique",2]
                    ]
                  }
                ]
              },
              {
                nom: "Semestre 8",
                ues: [
                  {
                    nom: "UE4 PDS",
                    cours: [
                      ["Urologie",2],
                      ["Traumatologie",2],
                      ["Chirurgie thoracique",2],
                      ["Chirurgie maxillo-faciale",2],
                      ["Pédiatrie 1 et Vaccinologie 4",7],
                      ["Imagerie médicale",3],
                      ["Situation d’intégration 5",2],
                      ["Stage clinique de pédiatrie",3],
                      ["Séminaire d’analyse des pratiques professionnelles 4",3]
                    ]
                  },
                  {
                    nom: "UE3 RCH",
                    cours: [
                      ["Méthodologie de la recherche 2",2]
                    ]
                  },
                  {
                    nom: "UE5 ACC",
                    cours: [
                      ["Psychologie médicale",2]
                    ]
                  }
                ]
              }
            ]
          },
          {
            nom: "Master 2 (Deuxième master)",
            semestres: [
              {
                nom: "Semestre 9",
                ues: [
                  {
                    nom: "UE4 PDS",
                    cours: [
                      ["Rhumatologie",2],
                      ["Maladies métaboliques - Diabétologie",2],
                      ["Endocrinologie",2],
                      ["Pédiatrie 2 et Vaccinologie 5",8],
                      ["Neurologie",5],
                      ["Gynécologie",8],
                      ["Anesthésiologie",3]
                    ]
                  }
                ]
              },
              {
                nom: "Semestre 10",
                ues: [
                  {
                    nom: "UE4 PDS",
                    cours: [
                      ["Chirurgie pédiatrique",2],
                      ["Neurochirurgie",2],
                      ["Chirurgie cardiovasculaire",2],
                      ["Orthopédie",2],
                      ["Chirurgie digestive",2],
                      ["Réanimation",2],
                      ["Psychiatrie",2],
                      ["Anatomie pathologique spéciale 2",2],
                      ["Santé publique : Management",2],
                      ["Séminaire d’analyse des pratiques professionnelles 5",2],
                      ["Situation d’intégration 6",2],
                      ["Stage clinique de chirurgie",3],
                      ["Stage clinique de médecine interne",3],
                      ["Médecine physique et réadaptation",2]
                    ]
                  }
                ]
              }
            ]
          },
          {
            nom: "Master 3 (Troisième master)",
            semestres: [
              {
                nom: "Semestre 11",
                ues: [
                  {
                    nom: "UE1 CSS",
                    cours: [
                      ["Médecine aéronautique",1],
                      ["Toxicologie",1],
                      ["Anthropologie",1],
                      ["Médecine traditionnelle",1]
                    ]
                  },
                  {
                    nom: "UE4 PDS",
                    cours: [
                      ["Chirurgie 3",4],
                      ["Maladies infectieuses et parasitaires",4],
                      ["Stomatologie",3],
                      ["Ophtalmologie",3],
                      ["Dermatologie",3],
                      ["Oto-rhino-laryngologie",4],
                      ["Gériatrie",2]
                    ]
                  },
                  {
                    nom: "UE7 REP",
                    cours: [
                      ["Communication pour le changement social et de comportement en santé 2",1]
                    ]
                  },
                  {
                    nom: "UE6 IDP",
                    cours: [
                      ["Médecine légale",1],
                      ["Droit médical",1]
                    ]
                  }
                ]
              },
              {
                nom: "Semestre 12",
                ues: [
                  {
                    nom: "UE1 CSS",
                    cours: [
                      ["Médecine du travail",1]
                    ]
                  },
                  {
                    nom: "UE2 GES",
                    cours: [
                      ["Séminaire en management",2]
                    ]
                  },
                  {
                    nom: "UE3 RCH",
                    cours: [
                      ["Bioéthique",1],
                      ["Rédaction médicale",2]
                    ]
                  },
                  {
                    nom: "UE4 PDS",
                    cours: [
                      ["Urgences et gestion des catastrophes",3],
                      ["Séminaire d’analyse des pratiques professionnelles 6",3],
                      ["Situation d’intégration 7",3],
                      ["Stage interné en neurologie et psychiatrie",12]
                    ]
                  },
                  {
                    nom: "UE5 ACC",
                    cours: [
                      ["Soins palliatifs",1]
                    ]
                  },
                  {
                    nom: "UE6 IDP",
                    cours: [
                      ["Éthique",1],
                      ["Déontologie médicale",1]
                    ]
                  }
                ]
              }
            ]
          },
          {
            nom: "Master 4 (Quatrième master)",
            semestres: [
              {
                nom: "Semestre 13",
                ues: [
                  {
                    nom: "UE4 PDS",
                    cours: [
                      ["Stage interné en médecine interne",12],
                      ["Stage interné en chirurgie",12],
                      ["Stage interné en spécialités et imagerie médicale",6]
                    ]
                  }
                ]
              },
              {
                nom: "Semestre 14",
                ues: [
                  {
                    nom: "UE4 PDS",
                    cours: [
                      ["Stage au Bureau central de la zone de santé",6],
                      ["Stage interné en gynéco-obstétrique",10],
                      ["Stage interné en pédiatrie et vaccinologie 7",10]
                    ]
                  },
                  {
                    nom: "UE3 RCH",
                    cours: [
                      ["Rédaction du travail de fin d’études",4]
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
      // , { nom: "Faculté de Droit", promotions: [ ... ] }   <- prochaines facultés ici
    ]
  },
  {
    nom: "Institut supérieur",
    niveau: "Département ou section",
    bientot: true,          // affiché « bientôt » : pas encore sélectionnable
    regles: null,
    facultes: []
  }
];
