import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer"
import type { ResumeSections } from "@/types/resume"

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 10,
    lineHeight: 1.4,
    color: "#1a1a1a",
  },
  header: {
    marginBottom: 16,
  },
  name: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
  },
  contactRow: {
    flexDirection: "row",
    gap: 12,
    fontSize: 9,
    color: "#555",
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 1,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingBottom: 3,
    marginTop: 14,
    marginBottom: 6,
  },
  entry: {
    marginBottom: 8,
  },
  entryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  entryTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
  },
  entrySubtitle: {
    fontSize: 9,
    color: "#555",
  },
  bullet: {
    flexDirection: "row",
    marginBottom: 1,
    paddingLeft: 12,
  },
  bulletPoint: {
    width: 4,
    marginRight: 4,
  },
  bulletText: {
    flex: 1,
    fontSize: 9,
  },
  skillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  skillBadge: {
    fontSize: 9,
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  skillCategory: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    marginTop: 4,
    marginBottom: 2,
  },
})

export function ResumeDocument({ sections, name }: { sections: ResumeSections; name: string }) {
  const { personal, education, skills, projects, experience, achievements } = sections

  const contactParts = [
    personal.email,
    personal.phone,
    personal.location,
    personal.linkedin,
    personal.github,
    personal.portfolio,
  ].filter(Boolean)

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>{personal.fullName || name}</Text>
          <View style={styles.contactRow}>
            {contactParts.map((part, i) => (
              <Text key={i}>{part}</Text>
            ))}
          </View>
        </View>

        {/* Education */}
        {education.entries.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Education</Text>
            {education.entries.map((entry, i) => (
              <View key={i} style={styles.entry}>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryTitle}>{entry.college}</Text>
                  <Text style={styles.entrySubtitle}>
                    {entry.startYear && entry.endYear ? `${entry.startYear} - ${entry.endYear}` : ""}
                  </Text>
                </View>
                <Text style={styles.entrySubtitle}>
                  {[entry.degree, entry.field].filter(Boolean).join(" in ")}
                  {entry.gpa ? ` | GPA: ${entry.gpa}` : ""}
                </Text>
              </View>
            ))}
          </>
        )}

        {/* Skills */}
        {Object.values(skills).some((arr) => arr.length > 0) && (
          <>
            <Text style={styles.sectionTitle}>Skills</Text>
            {(["languages", "frameworks", "databases", "tools", "cloud", "other"] as const).map((cat) => {
              const items = skills[cat]
              if (items.length === 0) return null
              return (
                <View key={cat} style={styles.skillCategory}>
                  <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold", textTransform: "capitalize", marginBottom: 2 }}>
                    {cat}
                  </Text>
                  <View style={styles.skillsRow}>
                    {items.map((skill, i) => (
                      <View key={i} style={styles.skillBadge}>
                        <Text>{skill}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )
            })}
          </>
        )}

        {/* Experience */}
        {experience.entries.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Experience</Text>
            {experience.entries.map((entry, i) => (
              <View key={i} style={styles.entry}>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryTitle}>{entry.company}</Text>
                  <Text style={styles.entrySubtitle}>{entry.location}</Text>
                </View>
                <Text style={styles.entrySubtitle}>
                  {entry.role}
                  {entry.startDate && entry.endDate ? ` | ${entry.startDate} - ${entry.endDate}` : ""}
                </Text>
                {entry.bullets.map((bullet, j) => (
                  <View key={j} style={styles.bullet}>
                    <Text style={styles.bulletPoint}>•</Text>
                    <Text style={styles.bulletText}>{bullet}</Text>
                  </View>
                ))}
              </View>
            ))}
          </>
        )}

        {/* Projects */}
        {projects.entries.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Projects</Text>
            {projects.entries.map((entry, i) => (
              <View key={i} style={styles.entry}>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryTitle}>{entry.name}</Text>
                  {entry.url && <Text style={styles.entrySubtitle}>{entry.url}</Text>}
                </View>
                <Text style={{ fontSize: 9, marginBottom: 2 }}>{entry.description}</Text>
                {entry.techStack.length > 0 && (
                  <View style={styles.skillsRow}>
                    {entry.techStack.map((tech, j) => (
                      <View key={j} style={styles.skillBadge}>
                        <Text>{tech}</Text>
                      </View>
                    ))}
                  </View>
                )}
                {entry.bullets.map((bullet, j) => (
                  <View key={j} style={styles.bullet}>
                    <Text style={styles.bulletPoint}>•</Text>
                    <Text style={styles.bulletText}>{bullet}</Text>
                  </View>
                ))}
              </View>
            ))}
          </>
        )}

        {/* Achievements */}
        {achievements.entries.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Achievements</Text>
            {achievements.entries.map((entry, i) => (
              <View key={i} style={styles.entry}>
                <Text style={styles.entryTitle}>{entry.title}</Text>
                {entry.description && <Text style={{ fontSize: 9 }}>{entry.description}</Text>}
              </View>
            ))}
          </>
        )}
      </Page>
    </Document>
  )
}
