%global debug_package %{nil}

Name: cockpit-app-freeipa
Version: 12
Release: 1
Summary: FreeIPA installer for Cockpit
License: LGPLv2+

Source: cockpit-app-freeipa.tar.gz
BuildArch: noarch

Requires: freeipa-server, cockpit

%description
FreeIPA application for Cockpit eases FreeIPA server deployment
by providing a visual way to construct FreeIPA installer configuration
and initiate installation of FreeIPA master or replica.

%prep
%setup -n cockpit-app-freeipa

%build

%install
make install-only DESTDIR=%{buildroot}
find %{buildroot} -type f >> files.list
sed -i "s|%{buildroot}||" *.list
chmod a+x %{buildroot}/usr/libexec/cockpit-app-freeipa-check-install

%files -f files.list
%dir %{_datadir}/cockpit/app-freeipa
%doc README.md

%changelog
* Thu Jan 18 2018 - Alexander Bokovoy <abokovoy@redhat.com> - 12-1
- Add a script to detect status of FreeIPA installation (client, server, not enrolled)
- Add new FreeIPA logo

* Mon Jan 15 2018 - Alexander Bokovoy <abokovoy@redhat.com> - 11-0
- Initial release
